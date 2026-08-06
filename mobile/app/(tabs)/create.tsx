import { Redirect } from "expo-router";

// The Create tab intercepts its own press to open the /compose modal; if the
// route is ever hit directly, forward to the composer.
export default function Create() {
  return <Redirect href="/compose" />;
}
