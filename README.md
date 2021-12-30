# SMARS

Lousy SMARS weather...

# How To Add New Maps:

1. Open the Blockland map editor from the Blockland Dev directory

2. Save a new map in the Blockland map editor

3. Open Blockland's basic_biomes file in that project's libraries directory.

4. Copy the contents of this map be the value of the variable 'rawMap' in the mapImporter.ts file in SMARS's map_editor directory.

5. In the map_editor's index.ts file update the name and type variables for your new map (lines 21 and 22).

6. From the root of the SMARS map_editor directory run this npm command:

   npm run add-map

7. [OPTIONAL] Check the database in powershell:

   mongo

   use smars

   db.maps.find()
