"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderPlus,
  LayoutDashboard,
  Library,
  Plus,
  Settings,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Deck } from "@/types/deck";

export function AppSidebar() {
  const pathname = usePathname();
  const { getItem } = useLocalStorage();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const storedDecks = getItem<Deck[]>("flashmaster:decks") || [];
    setDecks(storedDecks);

    // Extract unique categories
    const uniqueCategories = Array.from(
      new Set(storedDecks.map((deck) => deck.category).filter(Boolean))
    ) as string[];

    setCategories(uniqueCategories);
  }, [getItem]);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="mb-4">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <Library className="h-8 w-8 p-1 rounded-sm bg-primary text-white" />
          <span className="font-bold text-xl">
            <span className="text-primary">Flash</span>
            <span>Master</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/decks"}>
                  <Link href="/decks">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/statistics"}
                >
                  <Link href="/statistics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Statistics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Decks</SidebarGroupLabel>
            <Link href="/decks">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Deck</span>
              </Button>
            </Link>
          </div>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <SidebarMenu>
                {decks.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <div className="rounded-full bg-primary/10 p-2 mb-2 mx-auto w-fit">
                      <FolderPlus className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No decks yet
                    </p>
                    <Link
                      href="/decks"
                      className="mt-1 h-auto p-0 text-xs text-primary"
                    >
                      Create your first deck
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Uncategorized decks */}
                    {decks
                      .filter((deck) => !deck.category)
                      .map((deck) => (
                        <SidebarMenuItem key={deck.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === `/decks/${deck.id}`}
                          >
                            <Link href={`/decks/${deck.id}`}>
                              <span>{deck.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}

                    {/* Categorized decks */}
                    {categories.map((category) => (
                      <div key={category} className="mt-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {category}
                        </div>
                        {decks
                          .filter((deck) => deck.category === category)
                          .map((deck) => (
                            <SidebarMenuItem key={deck.id}>
                              <SidebarMenuButton
                                asChild
                                isActive={pathname === `/decks/${deck.id}`}
                              >
                                <Link href={`/decks/${deck.id}`}>
                                  <span>{deck.name}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                      </div>
                    ))}
                  </>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
