import { getCustomer } from "../../../../lib/queries/customers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({params}) => {
  const customer = await getCustomer(params.slug)

  return {
    customer,
  }
}
