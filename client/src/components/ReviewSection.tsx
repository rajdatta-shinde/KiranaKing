import type { Product } from "../types";
import DummyReviewsSection from "./DummyReviewsSection";

/**
 * Public review section for a product. Currently renders the generated
 * (seeded) review set; in Phase 2 this swaps to live reviews from the API
 * while keeping the same props.
 */
export default function ReviewSection({ product }: { product: Product }) {
  return <DummyReviewsSection product={product} />;
}
