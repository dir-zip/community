"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, InputField } from '@dir/ui'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { User } from "packages/db/drizzle/types"
import { Search } from 'lucide-react'
import { getAllUsers } from "~/features/admin/actions"
import { addUserToList } from "../actions"

export const AddUserModal = ({listSlug}: {listSlug: string}) => {
  const [showModal, setShowModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState<string | undefined>()
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const searchParams = useSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState<string | undefined>()
  const [localData, setLocalData] = useState<User[]>([])
  const [count, setCount] = useState(0)
  const modalOpen = searchParams.get('open') === 'true' ? true : false

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsers({
        skip: (page) * pageSize, 
        take: pageSize,
        where: {username: {contains: userSearchQuery}, lists: {none: {slug: listSlug}}}
      })
      setCount(users.count)
      setLocalData(users.users)
    }
    fetchUsers()
  }, [searchQuery, page, pageSize, userSearchQuery, searchParams])

  
  useEffect(() => {

    if (modalOpen) {
      setShowModal(true)
    }

  }, [modalOpen])


  const selectUser = (index: number) => {
    const user = localData[index];
    setSelectedIndex(index)
    // A hack to revalidate the list by changing the searchParams
    router.push(`/admin/lists/${listSlug}?open=false`)
    addUserToList({slug: listSlug, userId: user!.id})
    setShowModal(false)
  };

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();

        if (e.key === "ArrowUp") {
          e.preventDefault(); // Prevent scrolling
          setSelectedIndex((prevIndex) => (prevIndex - 1 + localData.length) % localData.length);
        } else if (e.key === "ArrowDown") {
          e.preventDefault(); // Prevent scrolling
          setSelectedIndex((prevIndex) => (prevIndex + 1) % localData.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          selectUser(selectedIndex);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, setSelectedIndex, selectUser]);

  return (
    <Dialog open={modalOpen} onOpenChange={() => {
      router.push(`/admin/lists/${listSlug}?open=false`)
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a user</DialogTitle>
        </DialogHeader>
        <InputField icon={<Search />} name='search' placeholder='Search' onChange={(e) => setUserSearchQuery(e.target.value)} value={userSearchQuery}/>
        {localData.map((c, index) => {
          return (
            <div className={`flex items-center justify-between cursor-pointer rounded px-4 py-2 ${index === selectedIndex ? 'bg-primary-900' : 'hover:bg-primary-800'}`} onClick={() => selectUser(index)} key={index}>
              <span className="text-sm">{c.username}</span>
            </div>
          )
        })}
      </DialogContent>
    </Dialog>
  )
}