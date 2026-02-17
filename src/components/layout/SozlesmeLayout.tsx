import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

interface SozlesmeLayoutProps {
  children: ReactNode;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

export default function SozlesmeLayout({
  children,
  title,
  icon: Icon,
}: SozlesmeLayoutProps) {
  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon className="w-6 h-6 text-cyan-600" />
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-blue max-w-none text-gray-800 prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

