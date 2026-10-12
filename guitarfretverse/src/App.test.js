import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

test('renders the explorer with the default C major scale', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /C Major \(Ionian\) Scale/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Explorer', selected: true })).toBeInTheDocument();
});

test('changing the key updates the fretboard immediately', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Key'), { target: { value: '9' } });
  expect(screen.getByRole('heading', { name: /A Major \(Ionian\) Scale/i })).toBeInTheDocument();
});

test('switching to arpeggio mode shows chord types', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'arpeggio' } });
  expect(screen.getByLabelText('Arpeggio')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /C Major Arpeggio/i })).toBeInTheDocument();
});

test('can open every tool tab', () => {
  render(<App />);
  ['Chords', 'Scale finder', 'Circle of fifths', 'Progressions', 'Quiz'].forEach((name) => {
    fireEvent.click(screen.getByRole('tab', { name }));
    expect(screen.getByRole('tab', { name, selected: true })).toBeInTheDocument();
  });
});

test('url state is restored on load', () => {
  window.history.replaceState(null, '', '/?mode=scale&root=A&scale=minor-pentatonic');
  render(<App />);
  expect(screen.getByRole('heading', { name: /A Minor Pentatonic Scale/i })).toBeInTheDocument();
});

test('progressions are worked out in the chosen key', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Progressions' }));
  fireEvent.change(screen.getByLabelText('Key'), { target: { value: '7' } });
  // I-V-vi-IV in G is G D Em C
  expect(screen.getAllByRole('button', { name: /^I\s*G$/ }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /^vi\s*Em$/ }).length).toBeGreaterThan(0);
});

test('can build a custom progression', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Progressions' }));
  const group = screen.getByRole('group', { name: /Chords in C major/i });
  fireEvent.click(group.querySelector('button')); // first chord, I
  expect(screen.getByLabelText('Remove C')).toBeInTheDocument();
});

test('chords tab includes the CAGED section with all five shapes', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Chords' }));
  expect(screen.getByRole('heading', { name: /The CAGED system/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /All 5 shapes of C/i })).toBeInTheDocument();
  ['C', 'A', 'G', 'E', 'D'].forEach((l) => expect(screen.getAllByText(`${l} shape`).length).toBeGreaterThan(0));
  fireEvent.change(screen.getByLabelText('Chord type'), { target: { value: 'min' } });
  expect(screen.getByRole('heading', { name: /All 3 shapes of Cm/i })).toBeInTheDocument();
});
