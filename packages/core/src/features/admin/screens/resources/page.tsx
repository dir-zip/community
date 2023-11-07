import { getResource } from '../../actions'
import Table from './components/Table'
import Form from './components/Form'
import { type ResourceSchema } from '../../../../index'
import {Suspense} from 'react'

export const AllResourcePage = async ({resource, schema}: {resource: string, schema: ResourceSchema}) => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">{resource.charAt(0).toUpperCase() + resource.slice(1)}</h3>
      <Suspense>
        <Table resource={resource} schema={schema}/>
      </Suspense>
    </div>
  )
}

export const SingleResourcePage = async ({resource, schema, params}: {resource: string, schema: ResourceSchema, params: {id: string}}) => {
  const findResource = await getResource({id: params.id, resource})
  
  return (
    <div>
      <Form resource={findResource} schema={schema} resourceRoot={resource} />
    </div>
  )
}