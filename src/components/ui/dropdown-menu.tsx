import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuContentProps>(
  ({ children, ...props }, ref) => (
    <DropdownMenuPrimitive.Content
      ref={ref}
      {...props}
      className="bg-white text-black rounded shadow-md p-2"
    >
      {children}
    </DropdownMenuPrimitive.Content>
  )
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuItemProps>(
  ({ children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      {...props}
      className="p-2 hover:bg-gray-200 cursor-pointer"
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownMenuItem.displayName = 'DropdownMenuItem';
