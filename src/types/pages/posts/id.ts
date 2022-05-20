export type StaticProps = {
  params: {
    id: string
  };
}

export type PostData = {
  id: string;
  contentHtml: string;
  title: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export type PostProps = {
  postData: PostData;
}
