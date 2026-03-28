import type { D1Database } from '@cloudflare/workers-types'

export function createMockD1Database(): D1Database {
  // Store batched statements with their SQL and params
  const batchedStatements: Array<{ sql: string; params: any[] }> = []

  const db = {
    tables: new Map<string, any[]>(),

    prepare: (sql: string) => {
      const tableName = extractTableName(sql)
      const operation = extractOperation(sql)

      const executeQuery = (params: any[] = []) => {
        const rows = db.tables.get(tableName) || []
        let filteredRows = [...rows]

        // Handle COUNT queries
        if (sql.includes('COUNT(*) as count')) {
          let count = filteredRows.length

          if (sql.includes('WHERE category_id = ?') || sql.includes('AND category_id = ?')) {
            const categoryIdIndex = sql.indexOf('category_id = ?')
            const paramIndex = getParamIndex(sql, categoryIdIndex)
            count = filteredRows.filter((r: any) => r.category_id === params[paramIndex]).length
          } else if (sql.includes('WHERE author_id = ?') || sql.includes('AND author_id = ?')) {
            const authorIdIndex = sql.indexOf('author_id = ?')
            const paramIndex = getParamIndex(sql, authorIdIndex)
            count = filteredRows.filter((r: any) => r.author_id === params[paramIndex]).length
          } else if (sql.includes('WHERE user_id = ?')) {
            const userIdIndex = sql.indexOf('user_id = ?')
            const paramIndex = getParamIndex(sql, userIdIndex)
            count = filteredRows.filter((r: any) => r.user_id === params[paramIndex]).length
            if (sql.includes('AND is_read = 0')) {
              count = filteredRows.filter((r: any) => r.user_id === params[paramIndex] && !r.is_read).length
            }
          }

          return [{ count }]
        }

        if (operation === 'SELECT') {
          // WHERE conditions (support both WHERE and AND)
          if (sql.includes('WHERE email = ?') || sql.includes('AND email = ?')) {
            const emailIndex = sql.indexOf('email = ?')
            const paramIndex = getParamIndex(sql, emailIndex)
            filteredRows = filteredRows.filter((r: any) => r.email === params[paramIndex])
          }
          if (sql.includes('WHERE username = ?') || sql.includes('AND username = ?')) {
            const usernameIndex = sql.indexOf('username = ?')
            const paramIndex = getParamIndex(sql, usernameIndex)
            filteredRows = filteredRows.filter((r: any) => r.username === params[paramIndex])
          }
          if (sql.includes('WHERE id = ?') || sql.includes('AND id = ?')) {
            const idIndex = sql.indexOf('id = ?')
            const paramIndex = getParamIndex(sql, idIndex)
            filteredRows = filteredRows.filter((r: any) => r.id === params[paramIndex])
          }
          if (sql.includes('WHERE user_id = ?') || sql.includes('AND user_id = ?')) {
            const userIdIndex = sql.indexOf('user_id = ?')
            const paramIndex = getParamIndex(sql, userIdIndex)
            filteredRows = filteredRows.filter((r: any) => r.user_id === params[paramIndex])
          }
          if (sql.includes('AND is_read = 0')) {
            filteredRows = filteredRows.filter((r: any) => !r.is_read)
          }
          if (sql.includes('AND is_read = ?')) {
            const readIndex = sql.indexOf('is_read = ?')
            const paramIndex = getParamIndex(sql, readIndex)
            filteredRows = filteredRows.filter((r: any) => r.is_read !== (params[paramIndex] === 1 || params[paramIndex] === true))
          }
          if (sql.includes('WHERE post_id = ?') || sql.includes('AND post_id = ?')) {
            const postIdIndex = sql.indexOf('post_id = ?')
            const paramIndex = getParamIndex(sql, postIdIndex)
            filteredRows = filteredRows.filter((r: any) => r.post_id === params[paramIndex])
          }
          if (sql.includes('WHERE category_id = ?') || sql.includes('AND category_id = ?')) {
            const categoryIdIndex = sql.indexOf('category_id = ?')
            const paramIndex = getParamIndex(sql, categoryIdIndex)
            filteredRows = filteredRows.filter((r: any) => r.category_id === params[paramIndex])
          }
          if (sql.includes('WHERE author_id = ?') || sql.includes('AND author_id = ?')) {
            const authorIdIndex = sql.indexOf('author_id = ?')
            const paramIndex = getParamIndex(sql, authorIdIndex)
            filteredRows = filteredRows.filter((r: any) => r.author_id === params[paramIndex])
          }
          if (sql.includes('WHERE target_type = ?') && sql.includes('AND target_id = ?')) {
            filteredRows = filteredRows.filter((r: any) => r.target_type === params[0] && r.target_id === params[1])
          }
          if (sql.includes('WHERE target_type = ?') && sql.includes('AND user_id = ?')) {
            filteredRows = filteredRows.filter((r: any) => r.target_type === params[0] && r.user_id === params[1])
          }

          // ORDER BY
          if (sql.includes('ORDER BY name')) {
            filteredRows.sort((a: any, b: any) => a.name.localeCompare(b.name))
          }
          if (sql.includes('ORDER BY created_at DESC')) {
            filteredRows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          }

          // LIMIT and OFFSET (support both fixed numbers and parameters)
          const limitMatch = sql.match(/LIMIT\s+(\d+|\?)/)
          const offsetMatch = sql.match(/OFFSET\s+(\d+|\?)/)
          if (limitMatch) {
            let limit: number
            let offset = 0

            if (limitMatch[1] === '?') {
              // Get limit from params
              const limitParamIndex = getParamIndex(sql, sql.indexOf('LIMIT'))
              limit = parseInt(params[limitParamIndex])
            } else {
              limit = parseInt(limitMatch[1])
            }

            if (offsetMatch) {
              if (offsetMatch[1] === '?') {
                // Get offset from params
                const offsetParamIndex = getParamIndex(sql, sql.indexOf('OFFSET'))
                offset = parseInt(params[offsetParamIndex])
              } else {
                offset = parseInt(offsetMatch[1])
              }
            }

            filteredRows = filteredRows.slice(offset, offset + limit)
          }

          return filteredRows
        }

        return rows
      }

      const executeFirst = (params: any[] = []) => {
        const results = executeQuery(params)
        return results.length > 0 ? results[0] : null
      }

      return {
        bind: (...bindParams: any[]) => {
          // Store the SQL and params for batch execution
          const statementIndex = batchedStatements.length
          batchedStatements.push({ sql, params: bindParams })

          return {
            first: async <T = any>() => {
              return executeFirst(bindParams) as T
            },
            all: async <T = any>() => {
              return { results: executeQuery(bindParams) as T[] }
            },
            run: async () => {
              if (operation === 'INSERT') {
                const newRecord = {
                  id: bindParams[0],
                  ...createRecordFromParams(tableName, bindParams),
                }
                const currentRows = db.tables.get(tableName) || []
                db.tables.set(tableName, [...currentRows, newRecord])
              } else if (operation === 'UPDATE') {
                const currentRows = db.tables.get(tableName) || []
                const updatedRows = currentRows.map((row: any) => {
                  // Check if this row should be updated
                  let shouldUpdate = true

                  if (sql.includes('WHERE id = ?')) {
                    const idIndex = sql.indexOf('id = ?')
                    const idParamIndex = getParamIndex(sql, idIndex)
                    if (row.id !== bindParams[idParamIndex]) {
                      shouldUpdate = false
                    }
                  }

                  if (shouldUpdate && sql.includes('AND user_id = ?')) {
                    const userIdIndex = sql.indexOf('AND user_id = ?')
                    const userIdParamIndex = getParamIndex(sql, userIdIndex)
                    if (row.user_id !== bindParams[userIdParamIndex]) {
                      shouldUpdate = false
                    }
                  }

                  if (sql.includes('WHERE user_id = ?') && sql.includes('is_read = ?')) {
                    if (row.user_id !== bindParams[0]) {
                      shouldUpdate = false
                    }
                  } else if (sql.includes('WHERE user_id = ?') && sql.includes('is_read = 0')) {
                    if (row.user_id !== bindParams[0] || row.is_read) {
                      shouldUpdate = false
                    }
                  }

                  if (!shouldUpdate) {
                    return row
                  }

                  // Apply updates
                  const updatedRow = { ...row }

                  if (sql.includes('title = ?')) {
                    const titleIndex = sql.indexOf('title = ?')
                    const paramIndex = getParamIndex(sql, titleIndex)
                    updatedRow.title = bindParams[paramIndex]
                  }
                  if (sql.includes('content = ?')) {
                    const contentIndex = sql.indexOf('content = ?')
                    const paramIndex = getParamIndex(sql, contentIndex)
                    updatedRow.content = bindParams[paramIndex]
                  }
                  if (sql.includes('category_id = ?')) {
                    const categoryIndex = sql.indexOf('category_id = ?')
                    const paramIndex = getParamIndex(sql, categoryIndex)
                    updatedRow.category_id = bindParams[paramIndex]
                  }
                  if (sql.includes('view_count = view_count + 1')) {
                    updatedRow.view_count = (row.view_count || 0) + 1
                  }
                  if (sql.includes('like_count = like_count + 1')) {
                    updatedRow.like_count = (row.like_count || 0) + 1
                  }
                  if (sql.includes('like_count = like_count - 1')) {
                    updatedRow.like_count = Math.max(0, (row.like_count || 0) - 1)
                  }
                  if (sql.includes('comment_count = comment_count + 1')) {
                    updatedRow.comment_count = (row.comment_count || 0) + 1
                  }
                  if (sql.includes('comment_count = comment_count - 1')) {
                    updatedRow.comment_count = Math.max(0, (row.comment_count || 0) - 1)
                  }
                  if (sql.includes('is_read = 1')) {
                    updatedRow.is_read = true
                  }
                  if (sql.includes('is_read = 0')) {
                    updatedRow.is_read = false
                  }
                  if (sql.includes('is_read = ?')) {
                    const readIndex = sql.indexOf('is_read = ?')
                    const paramIndex = getParamIndex(sql, readIndex)
                    updatedRow.is_read = bindParams[paramIndex] === 1 || bindParams[paramIndex] === true
                  }
                  if (sql.includes('is_read = 1')) {
                    updatedRow.is_read = true
                  }
                  if (sql.includes('deleted_at = CURRENT_TIMESTAMP') || sql.includes('deleted_at = ?')) {
                    updatedRow.deleted_at = new Date().toISOString()
                  }
                  if (sql.includes('updated_at = CURRENT_TIMESTAMP') || sql.includes('updated_at = ?')) {
                    updatedRow.updated_at = new Date().toISOString()
                  }

                  return updatedRow
                })
                db.tables.set(tableName, updatedRows)
              } else if (operation === 'DELETE') {
                const currentRows = db.tables.get(tableName) || []
                let filteredRows = currentRows

                if (sql.includes('WHERE id = ?')) {
                  filteredRows = currentRows.filter((row: any) => row.id !== bindParams[0])
                } else if (sql.includes('WHERE target_type = ?') && sql.includes('AND target_id = ?') && sql.includes('AND user_id = ?')) {
                  filteredRows = currentRows.filter((row: any) =>
                    !(row.target_type === bindParams[0] && row.target_id === bindParams[1] && row.user_id === bindParams[2])
                  )
                } else if (sql.includes('WHERE user_id = ?')) {
                  filteredRows = currentRows.filter((row: any) => row.user_id !== bindParams[0])
                }

                db.tables.set(tableName, filteredRows)
              }
              return { success: true, meta: {} }
            },
          }
        },
        first: async <T = any>() => {
          return executeFirst() as T
        },
        all: async <T = any>() => {
          return { results: executeQuery() as T[] }
        },
      }
    },
    batch: async (statements: any[]) => {
      // Get the statements data before clearing the array
      const statementsData = [...batchedStatements]

      // Clear the batched statements array
      batchedStatements.length = 0

      return statements.map((stmt: any, index: number) => {
        // Get the SQL and params from the stored batched statements
        const { sql, params } = statementsData[index] || { sql: '', params: [] }

        if (!sql) {
          return { results: [] }
        }

        const tableName = extractTableName(sql)
        const operation = extractOperation(sql)

        const executeQuery = () => {
          const rows = db.tables.get(tableName) || []
          let filteredRows = [...rows]

          // Handle SELECT queries
          if (operation === 'SELECT') {
            if (sql.includes('WHERE user_id = ?') && sql.includes('AND target_id = ?') && sql.includes('AND target_type = ?')) {
              filteredRows = filteredRows.filter((r: any) =>
                r.user_id === params[0] && r.target_id === params[1] && r.target_type === params[2]
              )
            }
            if (sql.includes('WHERE id = ?')) {
              filteredRows = filteredRows.filter((r: any) => r.id === params[0])
            }
            return { results: filteredRows }
          }

          // Handle INSERT queries
          if (operation === 'INSERT') {
            const newRecord = createRecordFromParams(tableName, params)
            const currentRows = db.tables.get(tableName) || []
            db.tables.set(tableName, [...currentRows, newRecord])
          }

          // Handle UPDATE queries
          if (operation === 'UPDATE') {
            const currentRows = db.tables.get(tableName) || []
            const updatedRows = currentRows.map((row: any) => {
              if (sql.includes('WHERE id = ?') && row.id === params[1]) {
                const updatedRow = { ...row }
                if (sql.includes('like_count = like_count + 1')) {
                  updatedRow.like_count = (row.like_count || 0) + 1
                }
                if (sql.includes('updated_at = CURRENT_TIMESTAMP')) {
                  updatedRow.updated_at = new Date().toISOString()
                }
                return updatedRow
              }
              return row
            })
            db.tables.set(tableName, updatedRows)
          }

          return { results: filteredRows }
        }

        return executeQuery()
      })
    },
    exec: async (sql: string) => {
      return { success: true, meta: {} }
    },
    dump: async () => {
      return ''
    },
  }

  return db as unknown as D1Database
}

function getParamIndex(sql: string, position: number): number {
  const beforePosition = sql.substring(0, position)
  return (beforePosition.match(/\?/g) || []).length
}

function extractTableName(sql: string): string {
  const match = sql.match(/FROM\s+(\w+)/i) || sql.match(/INSERT INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i) || sql.match(/DELETE FROM\s+(\w+)/i)
  return match ? match[1].toLowerCase() : 'unknown'
}

function extractOperation(sql: string): string {
  if (sql.trim().startsWith('SELECT')) return 'SELECT'
  if (sql.trim().startsWith('INSERT')) return 'INSERT'
  if (sql.trim().startsWith('UPDATE')) return 'UPDATE'
  if (sql.trim().startsWith('DELETE')) return 'DELETE'
  return 'UNKNOWN'
}

function createRecordFromParams(tableName: string, params: any[]): any {
  if (tableName === 'users') {
    return {
      username: params[1],
      email: params[2],
      password_hash: params[3],
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'posts') {
    return {
      title: params[1],
      content: params[2],
      author_id: params[3],
      category_id: params[4],
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'comments') {
    return {
      post_id: params[1],
      author_id: params[2],
      content: params[3],
      parent_id: params[4] || null,
      like_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'notifications') {
    return {
      user_id: params[1],
      type: params[2],
      title: params[3],
      message: params[4],
      link: params[5] || null,
      is_read: false,
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'categories') {
    return {
      name: params[1],
      description: params[2] || null,
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'post_tags') {
    return {
      post_id: params[1],
      tag_id: params[2],
    }
  }
  if (tableName === 'tags') {
    return {
      name: params[1],
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'likes') {
    return {
      user_id: params[1],
      target_id: params[2],
      target_type: params[3],
      created_at: new Date().toISOString(),
    }
  }
  return {}
}

export function setupMockData(db: any, tableName: string, data: any[]) {
  db.tables.set(tableName, data)
}