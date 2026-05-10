# note-creation Specification

## Purpose
TBD - created by archiving change fix-folder-create-and-startup. Update Purpose after archive.
## Requirements
### Requirement: Folder-scoped immediate note creation

When a user creates an immediate note from a folder-scoped note list, Tolaria SHALL create the backing markdown file inside the selected folder.

#### Scenario: Folder create action writes under selected folder

- **GIVEN** the note list is scoped to folder `Game Dev`
- **WHEN** the user activates create note from that note list
- **THEN** Tolaria creates the note at `<vault>/Game Dev/<generated-name>.md`
- **AND** the created note appears in the selected folder's note list after the vault refreshes

#### Scenario: Type section create behavior stays typed

- **GIVEN** the note list is scoped to type section `Project`
- **WHEN** the user activates create note from that note list
- **THEN** Tolaria creates a `Project` note with the existing typed-note behavior

