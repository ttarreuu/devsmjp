export const getDefaultHeaderOptions = (title) => ({
  headerShown: true,
  headerTitleAlign: 'center',
  headerTitleStyle: { fontWeight: 'bold', backgroundColor: 'transparent'},
  headerTitle: title,
  headerTransparent: true, // Makes the header background transparent
  // headerStyle: {
  //   backgroundColor: 'transparent', // Ensures no background color is applied
  //   elevation: 0, // Removes shadow on Android
  //   shadowOpacity: 0, // Removes shadow on iOS
  // },
});
