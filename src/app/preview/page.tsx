import { redirect } from 'next/navigation';

export default function PreviewIndex() {
  // For testing, redirect to a sample preview page
  redirect('/preview/sample');
}