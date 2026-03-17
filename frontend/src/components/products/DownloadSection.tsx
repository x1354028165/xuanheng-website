'use client';

interface DownloadFile {
  name: string;
  category: string;
  format: string;
  size: string;
  link?: string;
}

interface DownloadSectionProps {
  title: string;
  coverImg: string;
  files: DownloadFile[];
}

export default function DownloadSection({ title, coverImg, files }: DownloadSectionProps) {
  // 按 category 分组，保持原始顺序
  const groups: { category: string; files: DownloadFile[] }[] = [];
  files.forEach((f) => {
    const existing = groups.find((g) => g.category === f.category);
    if (existing) {
      existing.files.push(f);
    } else {
      groups.push({ category: f.category, files: [f] });
    }
  });

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-14 text-3xl font-bold text-[#0F172A] text-center">资料下载</h2>

        <div className="flex gap-16 items-start">

          {/* 左侧：产品图（裸图，无任何包裹） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImg}
            alt={title}
            className="w-56 shrink-0 h-auto object-contain"
          />

          {/* 右侧：按分类分组展示文件 */}
          <div className="flex-1 flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group.category}>
                {/* 分类标题 */}
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">{group.category}</h3>

                {/* 文件列表 */}
                <div className="flex flex-col gap-2">
                  {group.files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between px-5 py-3.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
                    >
                      {/* 文件名 */}
                      <span className="text-sm text-[#0F172A]">{file.name}</span>

                      {/* 下载 + 格式大小 */}
                      {file.link ? (
                        <a
                          href={file.link}
                          download
                          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#38C4E8] transition-colors shrink-0 ml-6"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {file.format}({file.size})
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-[#94A3B8] shrink-0 ml-6">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {file.format}({file.size})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
