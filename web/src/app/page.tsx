import { redirect } from 'next/navigation';

export default function RootPage() {
  // Direct users straight into the operations center
  redirect('/admin');
}
