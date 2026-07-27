import { supabase, isSupabaseConfigured, getEditKey } from './supabase'

export interface Article {
  id: string
  title: string
  category: 'SQL & Database' | 'Scripts' | 'Guides' | 'Config'
  content: string
  createdAt: number
  updatedAt: number
}

interface ArticleFromSupabase {
  id: string
  title: string
  category: string
  content: string | null
  created_at: string
  updated_at: string
  icon?: string
  author?: string
  tags?: string[]
}

const STORAGE_KEY = 'kb_articles'
const CATEGORIES: Array<'SQL & Database' | 'Scripts' | 'Guides' | 'Config'> = [
  'SQL & Database',
  'Scripts',
  'Guides',
  'Config',
]

// Helper to convert Supabase article format to App format
function supabaseToApp(data: ArticleFromSupabase): Article {
  return {
    id: data.id,
    title: data.title,
    category: data.category as 'SQL & Database' | 'Scripts' | 'Guides' | 'Config',
    content: data.content || '',
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

// Helper to convert App format to Supabase format
function appToSupabase(article: Article) {
  return {
    title: article.title,
    category: article.category,
    content: article.content,
    created_at: new Date(article.createdAt).toISOString(),
    updated_at: new Date(article.updatedAt).toISOString(),
  }
}

export class ArticleManager {
  private articles: Article[]
  private useSupabase: boolean

  constructor() {
    this.useSupabase = isSupabaseConfigured()
    this.articles = this.loadArticles()
    // Initialize with sample data if empty
    if (this.articles.length === 0) {
      this.initializeSampleData()
    }
  }

  private loadArticles(): Article[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private saveArticles(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.articles))
  }

  // Async version to load from Supabase (call this after component mounts)
  async loadArticlesFromSupabase(): Promise<Article[]> {
    if (!this.useSupabase || !supabase) {
      return this.articles
    }

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Error loading articles from Supabase:', error.message)
        return this.articles
      }

      if (data) {
        this.articles = (data as ArticleFromSupabase[]).map(supabaseToApp)
        // Also sync to localStorage as cache
        this.saveArticles()
      }

      return this.articles
    } catch (err) {
      console.error('[v0] Exception loading from Supabase:', err)
      return this.articles
    }
  }

  private initializeSampleData(): void {
    const samples: Article[] = [
      {
        id: 'sql-db-1',
        title: 'RLS policies cheat-sheet',
        category: 'SQL & Database',
        content: `# RLS policies cheat-sheet

Row Level Security (RLS) is essential for protecting database tables in Supabase. This guide covers enabling RLS and creating common policies.

## Enabling RLS on a Table

\`\`\`sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
\`\`\`

## Public Read Policy

Allow anyone to read articles:

\`\`\`sql
CREATE POLICY "select_articles_public"
  ON articles FOR SELECT
  USING (true);
\`\`\`

## Admin-Only Write Policy

Only users with admin role can create articles:

\`\`\`sql
CREATE POLICY "insert_articles_admin_only"
  ON articles FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM portal_users
      WHERE portal_users.id = auth.uid()
        AND portal_users.role IN ('super_admin', 'admin')
    )
  );
\`\`\`

## Verify Policies

Check all policies on your table:

\`\`\`sql
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'articles'
ORDER BY policyname;
\`\`\`

## Common Mistakes

- Forgetting to enable RLS before creating policies (policies won't work)
- Not checking \`auth.uid()\` in policies (allows data leaks)
- Using wrong role names (check portal_users.role values)`,
        createdAt: Date.now() - 259200000,
        updatedAt: Date.now() - 259200000,
      },
      {
        id: 'scripts-1',
        title: 'Bulk client import script',
        category: 'Scripts',
        content: `# Bulk client import script

This JavaScript snippet reads rows from a data source and inserts them into a Supabase table in batches, handling duplicates by phone number.

## Import Function

\`\`\`javascript
async function bulkImportClients(rows) {
  const supabase = createClient(url, key);
  const BATCH_SIZE = 100;
  let imported = 0;
  let duplicates = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    for (const row of batch) {
      // Check for existing phone
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', row.phone)
        .single();

      if (existing) {
        duplicates++;
        continue;
      }

      const { error } = await supabase
        .from('clients')
        .insert({
          name: row.name,
          phone: row.phone,
          email: row.email
        });

      if (!error) imported++;
    }
    
    console.log(\`Batch \${i / BATCH_SIZE + 1}: imported \${imported}, skipped \${duplicates}\`);
  }

  return { imported, duplicates };
}
\`\`\`

## Usage

\`\`\`javascript
const csvRows = parseCsv(csvData);
const result = await bulkImportClients(csvRows);
console.log(\`Done! Imported: \${result.imported}, Duplicates: \${result.duplicates}\`);
\`\`\`

## Important Notes

- Always check for duplicates by phone number before inserting
- Use batch processing to avoid rate limits
- Log progress for large imports (>10,000 rows)`,
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
      {
        id: 'guides-1',
        title: 'Deploy to GitHub Pages',
        category: 'Guides',
        content: `# Deploy to GitHub Pages

Step-by-step guide to deploying your Next.js static site to GitHub Pages.

## Step 1: Build Static Output

Configure Next.js for static export in \`next.config.js\`:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;
\`\`\`

Then build:

\`\`\`bash
npm run build
\`\`\`

## Step 2: Push to gh-pages Branch

\`\`\`bash
git branch -D gh-pages
git checkout --orphan gh-pages
git add out/
git commit -m "Deploy static build"
git push -u origin gh-pages
\`\`\`

## Step 3: Configure GitHub Pages

1. Go to Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select \`gh-pages\` branch and \`/ (root)\`
4. Click Save

## Step 4: Test Before Production

Visit \`https://yourusername.github.io/yourrepo/\` to verify the deployment works before pushing to production.

## Deploy to Cloudflare Pages

For better performance, import the GitHub repo into Cloudflare Pages:
1. Connect your GitHub account
2. Select the repository
3. Build command: \`npm run build\`
4. Output directory: \`out\`
5. Deploy!`,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'config-1',
        title: 'Supabase environment variables',
        category: 'Config',
        content: `# Supabase environment variables

Configuration guide for connecting your app to Supabase. These variables enable database access, authentication, and real-time features.

## Required Variables

### NEXT_PUBLIC_SUPABASE_URL

The public URL of your Supabase project.

**How to find it:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "Project URL"

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
\`\`\`

### NEXT_PUBLIC_SUPABASE_ANON_KEY

The anonymous (public) API key for client-side access.

**How to find it:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "anon" key under "Project API keys"

\`\`\`
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## SECURITY WARNING ⚠️

**NEVER use the service_role key in frontend code!**

The service_role key has unrestricted access to your database and bypasses RLS policies. It should only be used in:
- Backend APIs
- Server-side code
- Admin scripts

**Exposing service_role key compromises your entire database.**

## Using Env Vars

Create \`.env.local\` in your project root:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

Restart your dev server after adding env vars.

## Testing Connection

\`\`\`javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.from('articles').select('*')
\`\`\``,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    this.articles = samples
    this.saveArticles()
  }

  createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Article {
    const newArticle: Article = {
      ...article,
      id: `${article.category.toLowerCase()}-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.articles.push(newArticle)
    this.saveArticles()
    return newArticle
  }

  async createArticleAsync(
    article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Article> {
    // Supabase is the source of truth. Writes go through the
    // passphrase-protected RPC — the DB re-checks the key.
    if (this.useSupabase && supabase) {
      const key = getEditKey()
      if (!key) throw new Error('Not unlocked — enter the edit key first')

      const { data, error } = await supabase.rpc('kb_create_article', {
        p_key: key,
        p_title: article.title,
        p_category: article.category,
        p_content: article.content,
      })
      if (error) throw new Error(error.message)

      const created = supabaseToApp(data as ArticleFromSupabase)
      this.articles.unshift(created)
      this.saveArticles() // refresh local cache
      return created
    }

    // Offline fallback (no Supabase configured): local only
    return this.createArticle(article)
  }

  updateArticle(id: string, updates: Partial<Article>): void {
    const index = this.articles.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.articles[index] = {
        ...this.articles[index],
        ...updates,
        updatedAt: Date.now(),
      }
      this.saveArticles()
    }
  }

  async updateArticleAsync(id: string, updates: Partial<Article>): Promise<void> {
    if (this.useSupabase && supabase) {
      const key = getEditKey()
      if (!key) throw new Error('Not unlocked — enter the edit key first')

      const current = this.articles.find((a) => a.id === id)
      const merged = { ...current, ...updates } as Article

      const { data, error } = await supabase.rpc('kb_update_article', {
        p_key: key,
        p_id: id,
        p_title: merged.title,
        p_category: merged.category,
        p_content: merged.content,
      })
      if (error) throw new Error(error.message)

      const idx = this.articles.findIndex((a) => a.id === id)
      if (idx !== -1) this.articles[idx] = supabaseToApp(data as ArticleFromSupabase)
      this.saveArticles()
      return
    }

    // Offline fallback
    this.updateArticle(id, updates)
  }

  deleteArticle(id: string): void {
    this.articles = this.articles.filter((a) => a.id !== id)
    this.saveArticles()
  }

  async deleteArticleAsync(id: string): Promise<void> {
    if (this.useSupabase && supabase) {
      const key = getEditKey()
      if (!key) throw new Error('Not unlocked — enter the edit key first')

      const { error } = await supabase.rpc('kb_delete_article', {
        p_key: key,
        p_id: id,
      })
      if (error) throw new Error(error.message)

      this.articles = this.articles.filter((a) => a.id !== id)
      this.saveArticles()
      return
    }

    // Offline fallback
    this.deleteArticle(id)
  }

  getArticle(id: string): Article | undefined {
    return this.articles.find((a) => a.id === id)
  }

  getAllArticles(): Article[] {
    return [...this.articles]
  }

  getArticlesByCategory(category: string): Article[] {
    return this.articles.filter((a) => a.category === category)
  }

  searchArticles(query: string): Article[] {
    const q = query.toLowerCase()
    return this.articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    )
  }

  getCategories() {
    return CATEGORIES
  }
}
