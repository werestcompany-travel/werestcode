interface ArticleBodyProps {
  content: string
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <div
      className={[
        // Base text
        '[&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:text-[17px] [&_p]:mb-5',

        // Headings
        '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:leading-tight',
        '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight',
        '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-3',
        '[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-6 [&_h4]:mb-2',

        // Links
        '[&_a]:text-[#2534ff] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:transition-opacity [&_a:hover]:opacity-80',

        // Lists
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2',
        '[&_li]:text-gray-700 [&_li]:text-[17px] [&_li]:leading-relaxed',

        // Blockquote
        '[&_blockquote]:border-l-4 [&_blockquote]:border-[#2534ff] [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:py-3 [&_blockquote]:my-6',
        '[&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:bg-blue-50/50 [&_blockquote]:rounded-r-xl',

        // Strong / em
        '[&_strong]:font-bold [&_strong]:text-gray-900',
        '[&_em]:italic [&_em]:text-gray-700',

        // Code inline
        '[&_code]:bg-gray-100 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-gray-800',

        // Code block
        '[&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-2xl [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:text-sm [&_pre]:leading-relaxed',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100',

        // Images — full width, taller display
        '[&_img]:rounded-2xl [&_img]:w-full [&_img]:object-cover [&_img]:shadow-sm [&_img]:my-8',

        // Horizontal rule
        '[&_hr]:border-gray-200 [&_hr]:my-8',

        // Tables
        '[&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm',
        '[&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:px-4 [&_th]:py-2.5 [&_th]:border [&_th]:border-gray-200 [&_th]:text-left',
        '[&_td]:px-4 [&_td]:py-2.5 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-700',
        '[&_tr:nth-child(even)_td]:bg-gray-50/50',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
