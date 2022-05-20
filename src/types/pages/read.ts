export type PageDataProps = {
  id: string;
  contentHtml: string;
  title: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export type ReadProps = {
  pageData: PageDataProps;
}
