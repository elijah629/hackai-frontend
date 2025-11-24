import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Form from "next/form";
import { setApiKey } from "@/app/actions";

export function ApiKeyDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Key</DialogTitle>
          <DialogDescription>
            No key? Get one at{" "}
            <Button variant="link" size="sm" className="px-0!" asChild>
              <Link href="https://ai.hackclub.com">ai.hackclub.com</Link>
            </Button>
          </DialogDescription>
        </DialogHeader>
        <Form
          action={(e) => {
            setApiKey(e);
            onOpenChange?.(false);
          }}
        >
          <div className="flex flex-col pb-3 gap-3">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              name="apiKey"
              type="password"
              placeholder="sk-hc-v1-..."
              pattern="sk-hc-v1-[a-f0-9]{64}"
              title="sk-hc-v1-{64 lowercase hex}"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save API Key</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
