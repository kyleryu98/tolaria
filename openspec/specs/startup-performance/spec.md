# startup-performance Specification

## Purpose
TBD - created by archiving change fix-folder-create-and-startup. Update Purpose after archive.
## Requirements
### Requirement: Nonessential startup checks are deferred

Tolaria SHALL defer nonessential integration checks until after the first local UI render window, so vault loading and editor paint are prioritized on app launch.

#### Scenario: AI agent status check is delayed on mount

- **GIVEN** Tolaria starts with a vault ready to load
- **WHEN** the AI agent status hook mounts
- **THEN** it keeps the checking state initially
- **AND** it schedules the native status check after the startup defer window

#### Scenario: MCP status check is delayed on mount

- **GIVEN** Tolaria starts with a vault ready to load
- **WHEN** the MCP status hook mounts
- **THEN** it keeps the checking state initially
- **AND** it schedules the vault MCP status check after the startup defer window

#### Scenario: User-initiated checks remain immediate

- **GIVEN** the user explicitly refreshes MCP status or checks for updates
- **WHEN** the action is invoked
- **THEN** Tolaria performs the requested check without waiting for the startup defer window

### Requirement: Local fork builds do not install official updates by default

Tolaria local fork builds SHALL NOT install official upstream release-channel updates unless the fork build explicitly opts into official updates.

#### Scenario: Official update check is disabled for a local fork build

- **GIVEN** a local fork build without official update opt-in
- **WHEN** Tolaria checks for app updates
- **THEN** the check reports no available update

#### Scenario: Official update install is disabled for a local fork build

- **GIVEN** a local fork build without official update opt-in
- **WHEN** Tolaria is asked to download and install an official app update
- **THEN** the update install is rejected before downloading an official package

