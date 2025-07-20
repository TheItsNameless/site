import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        // from data-repo
        repo: "theitsnameless/site",
        // from data-repo-id
        repoId: "R_kgDONPwxpQ",
        // from data-category
        category: "itsnameless.de",
        // from data-category-id
        categoryId: "DIC_kwDONPwxpc4CkVLS",
        // other attributes
        inputPosition: "top",
        theme: "noborder_dark",
        reactionsEnabled: true,
        mapping: "pathname",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      Social: "https://social.itsnameless.de/",
      Quellcode: "https://github.com/theitsnameless/site",
      Kontakt: "/Kontakt",
      Lizenz: "/Lizenz",
      Datenschutz: "/Datenschutz",
      Impressum: "/Impressum",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Aktuelles",
        showTags: false,
        filter: (node) => node.data?.tags?.includes("hidden") !== true,
      }),
    ),
    Component.DesktopOnly(
      Component.Explorer({
        filterFn: (node) => {
          return node.data?.tags?.includes("hidden") !== true
        },
      }),
    ),
  ],
  right: [
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Backlinks()),
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
    Component.DesktopOnly(
      Component.Explorer({
        filterFn: (node) => {
          return node.data?.tags?.includes("hidden") !== true
        },
      }),
    ),
  ],
  right: [],
}

