-- Apply after the web build uses /api/platforms for public catalogue reads.
revoke execute on function public.list_public_platforms() from public, anon, authenticated;
