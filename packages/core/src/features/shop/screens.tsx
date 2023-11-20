
import { getAllItems } from "../admin/screens/items/actions"
import { ListItems } from "./components/ListItems"

export const ShopPage = async () => {
  const items = await getAllItems({skip: 0, take: 100})

  return (
    <div>
      <h3>Shop</h3>
      <ListItems items={items.items}/>
    </div>
  )
}