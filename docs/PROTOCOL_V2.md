# Structured visual-following protocol v2

## Purpose

StarbSense v2 uses a predefined sequence of visual fixation targets to make experimental sessions more repeatable than an unspecified or random star movement. It records the requested target position and task phase alongside the timestamped face/iris landmark measurements.

This is a research interaction protocol, not a clinical examination, cover test, calibrated gaze test, or validated strabismus screening protocol.

## Fixed sequence

The browser presents 17 stationary fixation steps in this order:

1. Center baseline fixation.
2. Left horizontal target.
3. Return to center.
4. Right horizontal target.
5. Return to center.
6. Upper vertical target.
7. Return to center.
8. Lower vertical target.
9. Return to center.
10. Upper-left diagonal target.
11. Return to center.
12. Upper-right diagonal target.
13. Return to center.
14. Lower-left diagonal target.
15. Return to center.
16. Lower-right diagonal target.
17. Final center fixation.

Each step has a fixed duration defined in `main.js`. The sequence order, target coordinates, task group, phase, and protocol identifier are stored with every frame sample. The protocol totals approximately 22 seconds; the exact total is calculated from the configured step durations.

## Recorded protocol fields

- `protocol_id`: version identifier for the task sequence.
- `task_index`: one-based position in the sequence.
- `task_label`: instruction displayed to the participant.
- `task_group`: baseline, horizontal, vertical, diagonal, or final fixation group.
- `task_phase`: target direction or center-return phase.
- `target_x_percent`, `target_y_percent`: target location within the game stage.
- `task_duration_target_ms`: planned duration of the current step.
- `task_elapsed_ms`: elapsed time since the current step began.
- `elapsed_ms` and `actual_frame_interval_ms`: session timing information.

## Interpretation

The sequence only defines where the visual target is presented and when. A webcam face/iris landmark is not a validated measure of where the participant is looking. The app must not infer that the participant successfully followed the target, that both eyes were aligned, or that a participant does or does not have strabismus.

The target path is a controlled stimulus, not a clinical test pattern. Do not describe the sequence as a diagnostic test or use it to generate an automatic pass/fail result.

## Future protocol validation

Before making scientific performance claims, the research team needs:

- A written, preregistered protocol and rationale for target locations and durations.
- A repeatability study under controlled camera distance, lighting, and display geometry.
- A prespecified data-quality rule that is not tuned after seeing outcomes.
- Comparison against an appropriate reference eye-tracking instrument and qualified clinical assessment, under professional supervision.
- Participant-level train/test separation for any later machine-learning work.
- Required ethics/school approvals, guardian permission, and participant assent for any research involving minors.
