import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // Component.Comments({
    //   provider: 'giscus',
    //   options: {
    //     // from data-repo
    //     repo: 'theitsnameless/site',
    //     // from data-repo-id
    //     repoId: 'R_kgDONPwxpQ',
    //     // from data-category
    //     category: 'itsnameless.de',
    //     // from data-category-id
    //     categoryId: 'DIC_kwDONPwxpc4CkVLS',
    //     // other attributes
    //     inputPosition: 'top',
    //     theme: 'noborder_dark',
    //     reactionsEnabled: true,
    //     mapping: 'pathname',
    //   }
    // }),
  ],
  footer: Component.Footer({
    links: {
      "Impressum": "/Impressum",
      "Datenschutz": "/Datenschutz",
      "Kontakt": "/Kontakt",
      "GitHub": "https://github.com/theitsnameless",
      "Reddit": "https://www.reddit.com/user/ItsNameless8676/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.RecentNotes({title: "Aktuelles", showTags: false}),
    Component.DesktopOnly(Component.Explorer({
      filterFn: (node) => {
        return node.file?.frontmatter?.tags?.includes("hidden") !== true
      }
    }
    )),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer({
      filterFn: (node) => {
        return node.file?.frontmatter?.tags?.includes("hidden") !== true
      }
    }
    )),
  ],
  right: [],
}
