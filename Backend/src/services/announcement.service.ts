import { getDatabase } from "../config/database";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: "General" | "HR Policy" | "Urgent" | "Event" | "Holiday";
  department?: string;
  authorName: string;
  createdAt: string;
  isPinned?: boolean;
}

const seedAnnouncements: AnnouncementItem[] = [
  {
    id: "anc_01",
    title: "🎉 Q3 Townhall & Quarterly Performance Celebration",
    content: "All team members are invited to join the Q3 All-Hands Townhall meeting this Friday at 4:00 PM in the Main Conference Room or via the Google Meet link.",
    category: "Event",
    department: "All Departments",
    authorName: "Sarah Jenkins (HR Admin)",
    createdAt: new Date().toISOString().split("T")[0],
    isPinned: true,
  },
  {
    id: "anc_02",
    title: "📌 Updated Paid Time Off & Attendance Leave Policy",
    content: "Please review the updated leave guidelines for FY2026. Employees can now roll over up to 5 days of unused Paid Time Off into the new year.",
    category: "HR Policy",
    department: "All Departments",
    authorName: "Sarah Jenkins (HR Admin)",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    isPinned: true,
  },
  {
    id: "anc_03",
    title: "⚠️ Scheduled Server Maintenance Notice",
    content: "The internal IT infrastructure will undergo routine maintenance on Sunday from 2:00 AM to 4:00 AM UTC. Intermittent service disruptions may occur during this window.",
    category: "Urgent",
    department: "Software Engineering",
    authorName: "IT Operations Team",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
    isPinned: false,
  },
];

export class AnnouncementService {
  private static async getCollection() {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection<AnnouncementItem>("announcements");
  }

  static async getAnnouncements() {
    try {
      const col = await this.getCollection();
      if (col) {
        const items = await col.find({}).sort({ isPinned: -1, createdAt: -1 }).toArray();
        if (items && items.length > 0) {
          return items.map((item) => ({
            id: item.id || item._id?.toString(),
            title: item.title,
            content: item.content,
            category: item.category,
            department: item.department,
            authorName: item.authorName,
            createdAt: item.createdAt,
            isPinned: item.isPinned,
          }));
        }
        // Seed collection if empty
        await col.insertMany(seedAnnouncements);
        return seedAnnouncements;
      }
    } catch (e) {
      console.warn("Announcement mongo fetch error, using in-memory:", e);
    }
    return seedAnnouncements;
  }

  static async createAnnouncement(data: Omit<AnnouncementItem, "id" | "createdAt"> & { createdAt?: string }) {
    const newAnc: AnnouncementItem = {
      ...data,
      id: `anc_${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      const col = await this.getCollection();
      if (col) {
        await col.insertOne(newAnc);
      }
    } catch (e) {
      console.warn("Announcement mongo insert error:", e);
    }

    seedAnnouncements.unshift(newAnc);
    return newAnc;
  }

  static async deleteAnnouncement(id: string) {
    try {
      const col = await this.getCollection();
      if (col) {
        await col.deleteOne({ $or: [{ id }, { _id: id as any }] });
      }
    } catch (e) {
      console.warn("Announcement mongo delete error:", e);
    }
    const idx = seedAnnouncements.findIndex((a) => a.id === id);
    if (idx !== -1) seedAnnouncements.splice(idx, 1);
    return true;
  }
}
