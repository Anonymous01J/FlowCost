import { Redirect } from 'expo-router';

export default function Index() {
  // Aquí podrías validar si el usuario está logueado
  return <Redirect href="/(screens)/home" />;
}