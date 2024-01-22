import { cn } from "@/utils";
import { Inventory, InventoryItem, Item } from "@dir/db";
import { Avatar } from "@dir/ui";

type RenderFunction<P> = (props: P) => React.ReactNode;

type modifiers = "username" | "avatar"


class EffectClass {
  name: string;
  modifies: modifiers;
  render: RenderFunction<Partial<Record<modifiers, string>> & {className?: string}>;

  constructor(name: string, modifier: modifiers, render: RenderFunction<Partial<Record<modifiers, string>> & {className?: string}>) {
    this.name = name;
    this.modifies = modifier;
    this.render = render;
  }
}


export const applyEffects = <T extends modifiers>(
  property: T,
  value: Partial<Record<modifiers, string>> & {className?: string},
  inventory: (Inventory & { collection: (InventoryItem & { item: Item | null, quantity?: number })[] }) | null
): React.ReactNode => {

  const effect = inventory?.collection
    .filter(inventoryItem => inventoryItem.equipped)
    .map(item => effects.find(effect => effect.name === item.item?.effect))
    .find(effect => effect && effect.modifies === property);

  if (effect) {
    // Include both 'username' and 'avatar' in the param object
    const param = {
      username: value.username,
      avatar: value.avatar,
      className: value.className
    } as Partial<Record<modifiers, string>> & {className?: string};
    return effect.render(param);
  }

  // If no effect is applied and the property is 'avatar', return the original avatar
  if (property === 'avatar') {
    return (
      <Avatar 
        imageUrl={value.avatar || ""} 
        fallback={value.username || ""}
        className={value.className}
      />
    );
  }

  if(property === 'username') {
    return <span className="text-link">{value.username}</span>
  }
  return null;
};


const rainbowUsername = new EffectClass(
  'rainbowUsername',
  'username',
  (props) => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    return (
      <div>
        {props.username?.split('').map((char, index) => (
          <span key={index} className="text-sm" style={{ color: colors[index % colors.length] }}>
            {char}
          </span>
        ))}
      </div>
    )
  }
);


const glitchAvatarBorder = new EffectClass(
  'glitchAvatarBorder',
  'avatar',
  (props) => {

    return (
      <div className={cn("border-4 border-gradient rounded-full flex items-center h-10 w-10 justify-center", props.className)} style={{borderImage: 'url(https://i.ibb.co/WDknxfN/0-2-1.webp) 329 245 227 297 stretch stretch'}}>
        <Avatar className="w-full h-full rounded-none" imageUrl={props.avatar as string} fallback={props.username as string} />
      </div>
    )
  }
);


const greenAvatarBorder = new EffectClass(
  'greenAvatarBorder',
  'avatar',
  (props) => {

    return (
      <div className={cn("border-4 border-emerald-500 rounded-full flex items-center h-10 w-10 justify-center", props.className)}>
        <Avatar className="w-full h-full" imageUrl={props.avatar as string} fallback={props.username as string} />
      </div>
    )
  }
);


export const effects = [
  rainbowUsername,
  greenAvatarBorder,
  glitchAvatarBorder,
]

