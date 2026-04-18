# Change Request: Add Section Progress Tracking

## Summary
Add a visual indicator that shows learners which sections they have already visited,
so they can track their own progress through the module without having to remember
which sections they've covered.

## Business Value
Learners currently have no persistent indication of where they are in the course.
A simple visited-state indicator would reduce cognitive load and encourage completion.

## Rough Scope
- Mark navigation buttons as "visited" once a section has been viewed
- Persist visited state in localStorage so it survives page refresh
- Do not change the existing active/selected styling

## Out of Scope
- Completion percentages or scores
- Server-side progress tracking
- Changes to the quiz or knowledge check section
