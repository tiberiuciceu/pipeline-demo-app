import { PipelineDiagram } from '../../components/PipelineDiagram'

export default function PipelinePage(): React.ReactElement {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live view of the agentic pipeline — updates in real time as each step runs.
        </p>
      </div>
      <div className="mx-auto max-w-3xl">
        <PipelineDiagram />
      </div>
    </div>
  )
}
