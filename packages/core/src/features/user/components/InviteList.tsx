"use client"
import { Button, InputField } from "@dir/ui";
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@dir/ui";

import { UserWithInventory } from "~/lib/types";
import { Plus } from "lucide-react";
import { createInvite } from "../actions";

export const InviteList = ({ currentUser }: { currentUser: UserWithInventory | null }) => {
  const [localToken, setLocalToken] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-bold">Invites</h3>
      <p className="antialiased text-sm">Create an invite to share with your people.</p>
      <div className="py-4">
        <Button className="flex gap-2" onClick={async () => {
          const createToken = await createInvite({userId: currentUser?.id!})
          setLocalToken(createToken)
          setIsModalOpen(true)
        }}><Plus className="w-4 h-4" /> <span>New Invite</span></Button>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open)
        }}>

          <DialogContent>
          <DialogHeader>
            <DialogTitle>Your invite code</DialogTitle>
          </DialogHeader>
            <InputField name="inviteCode" disabled value={localToken}/>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}