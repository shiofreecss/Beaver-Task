import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTaskStore, type KanbanColumn } from '@/store/tasks'
import { toast } from '@/components/ui/use-toast'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd'

interface KanbanColumnSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
}

export function KanbanColumnSettings({ open, onOpenChange, projectId }: KanbanColumnSettingsProps) {
  const { columns, addColumn, updateColumn, deleteColumn } = useTaskStore()
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('#E5E7EB') // Default gray color

  const projectColumns = columns
    .filter(col => col.projectId === projectId)
    .sort((a, b) => a.order - b.order)

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      toast({
        title: 'Error',
        description: 'Column name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      await addColumn({
        name: newColumnName,
        color: newColumnColor,
        order: projectColumns.length,
        projectId,
      })
      setNewColumnName('')
      setNewColumnColor('#E5E7EB')
      toast({
        title: 'Success',
        description: 'Column added successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add column',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId)
      toast({
        title: 'Success',
        description: 'Column deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete column',
        variant: 'destructive',
      })
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const column = projectColumns[sourceIndex]
    const newOrder = destinationIndex

    try {
      await updateColumn(column.id, { order: newOrder })
      
      // Update orders for affected columns
      const affectedColumns = projectColumns
        .filter((_, index) => {
          if (sourceIndex < destinationIndex) {
            return index > sourceIndex && index <= destinationIndex
          } else {
            return index < sourceIndex && index >= destinationIndex
          }
        })
        .map(col => ({
          ...col,
          order: sourceIndex < destinationIndex ? col.order - 1 : col.order + 1
        }))

      await Promise.all(
        affectedColumns.map(col => updateColumn(col.id, { order: col.order }))
      )

      toast({
        title: 'Success',
        description: 'Column order updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update column order',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Kanban Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="columnName">New Column Name</Label>
                <Input
                  id="columnName"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Enter column name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="columnColor">Color</Label>
                <Input
                  id="columnColor"
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="w-[60px] p-1 h-10"
                />
              </div>
            </div>
            <Button onClick={handleAddColumn} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Current Columns</Label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {projectColumns.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-2 bg-card p-2 rounded-md border"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: column.color }}
                            />
                            <span className="flex-1">{column.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteColumn(column.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 