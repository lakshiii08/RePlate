import { redirect } from 'next/navigation';

export default function ShelterPageRedirect() {
  redirect('/recipient/dashboard');
}
