export type Book = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  summary_fr: string | null;
  summary_en: string | null;
  excerpt_url: string | null;
  cover_url: string | null;
  genre: string | null;
  publication_year: number | null;
  purchase_links: Array<{ label: string; url: string }> | null;
  is_published: boolean;
  display_order: number | null;
  created_at: string;
};

export type Article = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  content_fr: string | null;
  content_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  category: "reflexions" | "actualites" | "publications" | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title_fr: string;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  event_type: "conference" | "dedicace" | "salon" | "rencontre" | null;
  event_date: string;
  location: string | null;
  city: string | null;
  country: string | null;
  registration_url: string | null;
  is_published: boolean;
};

export type GalleryPhoto = {
  id: string;
  image_url: string;
  caption_fr: string | null;
  caption_en: string | null;
  category: "dedicaces" | "evenements" | "rencontres" | "portraits" | null;
  display_order: number | null;
};

export type Resource = {
  id: string;
  title_fr: string;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  file_url: string;
  resource_type: "fiche_lecture" | "support_pedagogique" | "autre" | null;
  is_free: boolean;
};

export type Review = {
  id: string;
  book_id: string | null;
  reviewer_name: string;
  reviewer_location: string | null;
  review_text: string;
  rating: number | null;
  created_at: string;
};
