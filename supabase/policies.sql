drop policy if exists "Users can select own bookmarks" on public.bookmarks;
drop policy if exists "Users can insert own bookmarks" on public.bookmarks;
drop policy if exists "Users can update own bookmarks" on public.bookmarks;
drop policy if exists "Users can delete own bookmarks" on public.bookmarks;

create policy "Users can select own bookmarks"
  on public.bookmarks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own bookmarks"
  on public.bookmarks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks
  for delete
  to authenticated
  using (auth.uid() = user_id);
