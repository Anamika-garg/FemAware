const PageHeader = ({ eyebrow, title, description, actions, children }) => (
  <header className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h1 className="page-title text-balance">{title}</h1>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
      ) : null}
      {children}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
  </header>
);

export default PageHeader;
