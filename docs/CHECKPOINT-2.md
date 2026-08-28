# Checkpoint 2 notes (E–F)

Internal review notes. Not a public release.

## Persistence

`PersistenceAdapter` (`load` / `save`) is implemented by `LocalStorageAdapter`. Repositories return new `AppState` objects. React `setState` is the unit of work that calls `adapter.save`.

Same browser key as Checkpoint 1 (`img-compass-canada.v1`). `migrateToCurrent` upgrades v1 blobs to `AppState` version 2.

## Journey status

Stage dots are **derived** in `computeJourneySnapshot` from module data (no stored `stageProgress`).
