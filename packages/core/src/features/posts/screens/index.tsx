import Link from "next/link"
import { getAllPosts } from "../actions"
import { Button, Table } from '@dir/ui'


export const AllPosts = async ({loggedIn}: {loggedIn: boolean}) => {
  const categories = await getAllPosts()

  const columns = [
    {
      accessorKey: 'title',
      id: 'title',
    },
    {
      accessorKey: 'author',
      id: 'author',
    },
    {
      accessorKey: 'date',
      id: 'date',
    }
  ];

  const data = [
    { title: 'Post 1', author: 'Author 1', date: '2022-01-01' },
    { title: 'Post 2', author: 'Author 2', date: '2022-01-02' },
    { title: 'Post 3', author: 'Author 3', date: '2022-01-03' }
  ];


  return (
    <div className="px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Posts</h2>
        <Button>Test</Button>
      </div>

      <div className="py-4">
      <Table
        columns={columns}
        data={data}
        pageCount={1}
        pageIndex={0}
        pageSize={3}
        hasNext={false}
        hasPrevious={false}
        totalCount={3}
        startPage={0}
        endPage={0}
      />
      </div>


      <div>
        {categories.map((c,i) => {
          return (
            <div key={i}>
              <div className="py-4">
                <h3 className="text-xl font">{c.title}</h3>
              </div>
              {c.posts.map((p, i) => {
                return (
                  <div key={i}>
                    <Link href={`/posts/${p.slug}`}><p>{p.title}</p></Link>
                    <Link href={`/profile/${p.user.username}`}><p>{p.user.username}</p></Link>
                    <p>{p.createdAt.toDateString()}</p>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
