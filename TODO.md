# TODO: Implement Supply Request System Interface

## Steps to Complete

1. **Create TaskContext.tsx**: ✅ Implement a React context to manage the global state of pending tasks, including functions to add new tasks.

2. **Update App.tsx**: ✅ Modify the navigation structure to use a stack navigator wrapping the bottom tab navigator, allowing navigation to the new SupplyRequest screen.

3. **Modify Tasks.tsx**: ✅ Update the Tasks screen to use TaskContext, display the delivery queue in the specified format (Task ID, priority tag, source/destination, items, requester/timestamp), and add a floating action button (FAB) in the bottom right that navigates to the SupplyRequest screen.

4. **Create SupplyRequest.tsx**: ✅ Develop the new SupplyRequest screen with the request form (nurse name input, multi-select supplies buttons, single-select source/destination buttons, priority radio buttons, notes textarea) on the left and the delivery queue on the right, using a row layout for desktop-like appearance.

5. **Test the Implementation**: ✅ Run the app using `expo start`, verify form submission updates the queue, and ensure UI responsiveness on mobile devices.
