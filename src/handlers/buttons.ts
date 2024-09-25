import { Table } from "tablifier"

import type { Button, GlobClient } from "../types"
import { loadFiles } from "../lib/files"

export async function handleButtons(client: GlobClient) {
  const table = new Table(" Button ", " Status ")

  client.buttons.clear()

  const files = await loadFiles("buttons")
  files.forEach(file => {
    const { button } = require(file) as { button: Button }
    try {
      client.buttons.set(button.name, button)
      table.addRow(button.name, " ✔️  ")
    } catch (error) {
      table.addRow(button.name, " ❌  ")
    }
  })

  console.log(table.toString())
}
