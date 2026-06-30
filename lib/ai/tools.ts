/**
 * Tool definitions shared by the AI service layer.
 * These use the OpenAI function-calling schema format, which the Gemini
 * service layer converts to Gemini FunctionDeclarations before each call.
 */

export interface AITool {
  type: 'function'
  function: {
    name:        string
    description: string
    parameters:  Record<string, unknown>
  }
}

export const tools: AITool[] = [
  {
    type: 'function',
    function: {
      name: 'find_item',
      description:
        'Search for a stored item by name or keyword to find where it is located. Use when the user asks where something is.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Item name or keyword, e.g. "passport", "charger", "blue bag"',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_item',
      description: 'Add a new item with its storage location to WhereDidItGo tracker.',
      parameters: {
        type: 'object',
        properties: {
          name:     { type: 'string', description: 'Item name' },
          location: { type: 'string', description: 'Where the item is stored' },
          category: {
            type: 'string',
            enum: ['Documents', 'Electronics', 'Keys', 'Clothing', 'Jewelry', 'Other'],
          },
          notes: { type: 'string', description: 'Additional details (optional)' },
        },
        required: ['name', 'location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_routine',
      description: 'Create a recurring routine or reminder for the user.',
      parameters: {
        type: 'object',
        properties: {
          title:         { type: 'string' },
          frequency:     { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'] },
          interval:      { type: 'number', description: 'Number of units between repetitions' },
          interval_unit: { type: 'string', enum: ['days', 'weeks', 'months'] },
          next_due: {
            type: 'string',
            description: 'ISO date string YYYY-MM-DD for next/first occurrence',
          },
          notes: { type: 'string' },
        },
        required: ['title', 'frequency', 'next_due'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_history',
      description:
        'Search activity history (LifeLog) to find when something was last done.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Activity to search for' },
          time_filter: {
            type: 'string',
            enum: ['this_month', 'this_week', 'this_year', 'all_time'],
            description: 'Optional time range to narrow search',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_routines',
      description: "Get the user's pending or overdue routines.",
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'today', 'overdue'],
            description: 'Filter scope for routines',
          },
        },
        required: ['filter'],
      },
    },
  },
]
