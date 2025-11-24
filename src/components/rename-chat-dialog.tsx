import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/chat-store";

import Form from "next/form";
import { useState } from "react";
import { EmojiPickerIcon } from "./emoji-picker-icon";

export function RenameChatDialog({
  id,
  name,
  icon,
  open,
  onOpenChange,
}: {
  id: string;
  name: string;
  icon: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [emoji, setEmoji] = useState(icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename chat</DialogTitle>
        </DialogHeader>
        <Form
          action={(e) => {
            db.chats.update(id, {
              title: e.get("name") as string,
              icon: emoji,
            });
            onOpenChange?.(false);
          }}
        >
          <div className="flex flex-col pb-3 gap-3">
            <Label htmlFor="name">New chat name</Label>
            <div className="flex gap-2">
              <EmojiPickerIcon emoji={emoji} onEmojiChange={setEmoji} />
              <Input id="name" name="name" defaultValue={name} required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Rename Chat</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
