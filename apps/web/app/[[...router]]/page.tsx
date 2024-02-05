import { PageInit, generateMetadata as routerGenerateMetadata } from "../../lib/router";

export async function generateMetadata({ params }: { params: { router: string[] } }) {
  const meta = routerGenerateMetadata(params);
  return meta;
}
export default PageInit

