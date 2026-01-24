import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ObjectCannedACL, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { auth } from "@/auth";

const getS3Client = (regionOverride?: string) => {
  const region = (regionOverride || process.env.S3_REGION || process.env.AWS_REGION || '').trim();
  const endpoint = (process.env.S3_ENDPOINT || '').trim();
  const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || '').toLowerCase() === 'true';
  if (!region) {
    throw new Error('S3 region eksik');
  }
  return new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    ...(forcePathStyle ? { forcePathStyle } : {}),
  });
};

const buildPublicUrl = (bucket: string, key: string, region: string) => {
  const base = (process.env.S3_PUBLIC_BASE_URL || '').trim();
  if (base) {
    return `${base.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key.replace(/^\/+/, '')}`;
};

const saveLocalFile = (buffer: Buffer, filename: string) => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return { url: `/uploads/${filename}`, key: `uploads/${filename}` };
};

const createUploadScan = async () => {
  return { queued: false, id: null, status: 'CLEAN' };
};

const parseS3Url = (raw: string) => {
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.replace(/^\/+/, '');
    let bucket = '';
    let region = '';
    let key = '';
    if (host.endsWith('amazonaws.com')) {
      if (host.startsWith('s3.')) {
        region = host.split('.')[1] || '';
        if (!region || region === 'amazonaws') region = 'us-east-1';
        const parts = path.split('/').filter(Boolean);
        bucket = parts.shift() || '';
        key = parts.join('/');
      } else if (host.startsWith('s3-')) {
        region = host.split('.')[0].slice(3) || 'us-east-1';
        const parts = path.split('/').filter(Boolean);
        bucket = parts.shift() || '';
        key = parts.join('/');
      } else if (host.includes('.s3.')) {
        const parts = host.split('.');
        bucket = parts[0] || '';
        const s3Index = parts.indexOf('s3');
        region = s3Index >= 0 ? (parts[s3Index + 1] || '') : '';
        if (!region || region === 'amazonaws') region = 'us-east-1';
        key = path;
      } else if (host.endsWith('.s3.amazonaws.com')) {
        bucket = host.split('.s3.amazonaws.com')[0] || '';
        region = 'us-east-1';
        key = path;
      }
    }
    return { bucket, region, key };
  } catch {
    return { bucket: '', region: '', key: '' };
  }
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const keyParam = url.searchParams.get('key') || '';
    const urlParam = url.searchParams.get('url') || '';
    let key = keyParam.trim();
    const remoteUrl = urlParam.trim();
    const parsedS3 = remoteUrl ? parseS3Url(remoteUrl) : { bucket: '', region: '', key: '' };
    if (!key && remoteUrl) {
      try {
        const parsed = new URL(remoteUrl);
        key = parsedS3.key || parsed.pathname.replace(/^\/+/, '');
      } catch {}
    }
    const envBucket = (process.env.S3_BUCKET || '').trim();
    const envRegion = (process.env.S3_REGION || process.env.AWS_REGION || '').trim();
    const bucket = envBucket || parsedS3.bucket;
    const region = envRegion || parsedS3.region;
    const canUseS3 = !!bucket && !!region;
    if (!key && !remoteUrl) {
      return NextResponse.json({ success: false, error: 'Key eksik' }, { status: 400 });
    }
    if (canUseS3 && key) {
      try {
        const s3 = getS3Client(region);
        const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const body = obj.Body as any;
        if (!body) {
          return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 404 });
        }
        let stream: ReadableStream<Uint8Array> | null = null;
        if (typeof body.transformToWebStream === 'function') {
          stream = body.transformToWebStream() as ReadableStream<Uint8Array>;
        } else if (body instanceof Readable) {
          stream = Readable.toWeb(body) as unknown as ReadableStream<Uint8Array>;
        }
        if (!stream && body instanceof Uint8Array) {
          return new Response(Buffer.from(body), {
            headers: {
              'Content-Type': obj.ContentType || 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
        if (!stream) {
          return NextResponse.json({ success: false, error: 'Dosya akışı okunamadı' }, { status: 500 });
        }
        return new Response(stream, {
          headers: {
            'Content-Type': obj.ContentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (err) {
        if (!remoteUrl) {
          const msg = typeof (err as any)?.message === 'string' ? (err as any).message : 'Dosya okunamadı';
          return NextResponse.json({ success: false, error: msg }, { status: 500 });
        }
      }
    }
    if (!remoteUrl) {
      return NextResponse.json({ success: false, error: 'S3 ayarları eksik' }, { status: 500 });
    }
    try {
      const res = await fetch(remoteUrl, { cache: 'no-store' });
      if (!res.ok || !res.body) {
        return NextResponse.json({ success: false, error: `Dosya alınamadı (${res.status})` }, { status: res.status });
      }
      return new Response(res.body, {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Dosya okunamadı';
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
  } catch (error: any) {
    const msg = typeof error?.message === 'string' ? error.message : 'Dosya okunamadı';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let data: FormData;
    try {
      data = await request.formData();
    } catch {
      return NextResponse.json({ success: false, error: 'Form verisi okunamadı' }, { status: 400 });
    }

    const isFileLike = (v: unknown): v is File => {
      return !!v && typeof v === 'object' && typeof (v as any).arrayBuffer === 'function' && typeof (v as any).name === 'string';
    };

    let file: File | null = null;
    const entry = data.get('file');
    if (isFileLike(entry)) file = entry;

    if (!file) {
      for (const [, value] of data.entries()) {
        if (isFileLike(value)) {
          file = value;
          break;
        }
      }
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya yüklenmedi' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 
      'image/bmp', 'image/tiff', 'image/avif', 'image/heic', 'image/heif'
    ];
    
    let isValidType = validTypes.includes(file.type) || file.type.startsWith('image/');

    // Fallback: Check extension if type is missing or generic
    if (!isValidType) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'heic', 'heif', 'jfif', 'jif'];
      if (ext && validExts.includes(ext)) {
        isValidType = true;
      }
    }

    if (!isValidType) {
      return NextResponse.json(
        { success: false, error: `Geçersiz dosya tipi (${file.type || 'bilinmiyor'}). Sadece resim dosyaları yüklenebilir.` },
        { status: 400 }
      );
    }

    // Validate file size (20MB match nginx)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
       return NextResponse.json({ success: false, error: `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum 20MB.` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '') || 'upload.jpg';
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const normalizedName =
      ext === 'jfif' || ext === 'jif'
        ? originalName.replace(/\.(jfif|jif)$/i, '.jpg')
        : originalName;
    const filename = `${uniqueSuffix}-${normalizedName}`;
    
    try {
      const bucket = (process.env.S3_BUCKET || '').trim();
      const region = (process.env.S3_REGION || process.env.AWS_REGION || '').trim();
      const canUseS3 = bucket && region;
      const allowLocal =
        process.env.ALLOW_LOCAL_UPLOADS === 'true' ||
        process.env.NODE_ENV !== 'production' ||
        !canUseS3;
      if (!canUseS3) {
        if (!allowLocal) {
          const missing = [!bucket ? 'S3_BUCKET' : null, !region ? 'S3_REGION' : null].filter(Boolean).join(', ');
          return NextResponse.json({ success: false, error: `${missing} eksik` }, { status: 500 });
        }
        const { url } = saveLocalFile(buffer, filename);
        const scan = await createUploadScan();
        return NextResponse.json({ success: true, url, scan });
      }

      const prefixRaw = (process.env.S3_UPLOAD_PREFIX || 'uploads').trim();
      const prefix = prefixRaw.replace(/^\/+|\/+$/g, '');
      const key = prefix ? `${prefix}/${filename}` : filename;

      const s3 = getS3Client();
      const objectAclRaw = (process.env.S3_OBJECT_ACL || '').trim();
      const allowedAcls = new Set<ObjectCannedACL>([
        'private',
        'public-read',
        'public-read-write',
        'authenticated-read',
        'aws-exec-read',
        'bucket-owner-read',
        'bucket-owner-full-control',
      ]);
      const objectAcl = allowedAcls.has(objectAclRaw as ObjectCannedACL)
        ? (objectAclRaw as ObjectCannedACL)
        : undefined;
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
        ...(objectAcl ? { ACL: objectAcl } : {}),
      }));

      const url = buildPublicUrl(bucket, key, region);
      try {
        const scan = await createUploadScan();
        return NextResponse.json({ success: true, url, scan });
      } catch (err: any) {
        if (err?.code !== 'P2021') {
          try {
            await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
          } catch {}
          return NextResponse.json({ success: false, error: 'Tarama kuyruğa alınamadı' }, { status: 500 });
        }
        return NextResponse.json({ success: true, url, scan: { queued: false, id: null, status: 'SKIPPED' } });
      }
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Dosya kaydedilemedi';
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    const msg = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
