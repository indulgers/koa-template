#!/usr/bin/env ts-node

/**
 * 交互式 API 调试器
 * 使用方法: ts-node interactive-debugger.ts
 */

import axios from "axios";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class InteractiveAPIDebugger {
  private baseUrl: string = "http://localhost:3000";
  private lastResponse: any = null;
  private userIds: string[] = [];
  private postIds: string[] = [];

  constructor() {
    console.log("🔧 Interactive API Debugger Started");
    console.log('Type "help" for available commands');
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      console.log(`\n🌐 ${method} ${this.baseUrl}${endpoint}`);
      if (data) {
        console.log("📤 Request Body:", JSON.stringify(data, null, 2));
      }

      const response = await axios({
        method: method as any,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });

      this.lastResponse = response.data;
      console.log("📥 Response:", JSON.stringify(response.data, null, 2));
      console.log(`✅ Status: ${response.status}`);

      // 自动提取ID
      this.extractIds(response.data);

      return response.data;
    } catch (error: any) {
      console.log("❌ Error:", error.response?.data || error.message);
      console.log(`❌ Status: ${error.response?.status || "Network Error"}`);
      return null;
    }
  }

  private extractIds(data: any) {
    if (Array.isArray(data)) {
      data.forEach((item) => this.extractIds(item));
    } else if (data && typeof data === "object") {
      if (data.id && data.email) {
        // 是用户
        if (!this.userIds.includes(data.id)) {
          this.userIds.push(data.id);
          console.log(`📝 Saved User ID: ${data.id}`);
        }
      }
      if (data.id && data.title) {
        // 是文章
        if (!this.postIds.includes(data.id)) {
          this.postIds.push(data.id);
          console.log(`📝 Saved Post ID: ${data.id}`);
        }
      }
    }
  }

  private showCommands() {
    console.log(`
📋 Available Commands:

🔧 General:
  url [new-url]     - Show or change base URL
  last              - Show last response
  ids               - Show saved IDs
  clear             - Clear saved IDs
  help              - Show this help
  exit              - Exit debugger

❤️  Health:
  health            - Health check

👥 Users:
  users             - Get all users
  user <id>         - Get user by ID
  user              - Get user (will prompt for ID)
  create-user       - Create new user (interactive)
  update-user <id>  - Update user (interactive)
  delete-user <id>  - Delete user

📝 Posts:
  posts             - Get all posts
  post <id>         - Get post by ID
  post              - Get post (will prompt for ID)
  create-post       - Create new post (interactive)
  update-post <id>  - Update post (interactive)
  delete-post <id>  - Delete post

🛠️  Quick Actions:
  quick-user        - Create test user quickly
  quick-post        - Create test post quickly
  cleanup           - Delete all saved posts and users

📊 Testing:
  test-all          - Run comprehensive test
  test-errors       - Test error cases

Current URL: ${this.baseUrl}
Saved User IDs: ${this.userIds.join(", ") || "none"}
Saved Post IDs: ${this.postIds.join(", ") || "none"}
`);
  }

  private async handleCommand(input: string) {
    const [command, ...args] = input.split(" ");

    switch (command.toLowerCase()) {
      case "help":
        this.showCommands();
        break;

      case "url":
        if (args[0]) {
          this.baseUrl = args[0];
          console.log(`✅ Base URL changed to: ${this.baseUrl}`);
        } else {
          console.log(`Current base URL: ${this.baseUrl}`);
        }
        break;

      case "last":
        if (this.lastResponse) {
          console.log(
            "Last Response:",
            JSON.stringify(this.lastResponse, null, 2)
          );
        } else {
          console.log("No previous response");
        }
        break;

      case "ids":
        console.log(`User IDs: ${this.userIds.join(", ") || "none"}`);
        console.log(`Post IDs: ${this.postIds.join(", ") || "none"}`);
        break;

      case "clear":
        this.userIds = [];
        this.postIds = [];
        console.log("✅ Cleared all saved IDs");
        break;

      case "health":
        await this.request("GET", "/health");
        break;

      case "users":
        const users = await this.request("GET", "/users");
        if (users && Array.isArray(users)) {
          users.forEach((user: any) => {
            if (!this.userIds.includes(user.id)) {
              this.userIds.push(user.id);
            }
          });
        }
        break;

      case "user":
        const userId = args[0] || (await this.selectId("user"));
        if (userId) {
          await this.request("GET", `/users/${userId}`);
        }
        break;

      case "create-user":
        const email = await this.question("Enter email: ");
        const name = await this.question("Enter name (optional): ");
        if (email) {
          await this.request("POST", "/users", {
            email,
            name: name || undefined,
          });
        }
        break;

      case "quick-user":
        const timestamp = Date.now();
        await this.request("POST", "/users", {
          email: `test${timestamp}@example.com`,
          name: `Test User ${timestamp}`,
        });
        break;

      case "update-user":
        const updateUserId = args[0] || (await this.selectId("user"));
        if (updateUserId) {
          const newName = await this.question("Enter new name (optional): ");
          const newEmail = await this.question("Enter new email (optional): ");
          const updateData: any = {};
          if (newName) updateData.name = newName;
          if (newEmail) updateData.email = newEmail;

          if (Object.keys(updateData).length > 0) {
            await this.request("PUT", `/users/${updateUserId}`, updateData);
          }
        }
        break;

      case "delete-user":
        const deleteUserId = args[0] || (await this.selectId("user"));
        if (deleteUserId) {
          const confirm = await this.question(
            `Delete user ${deleteUserId}? (y/N): `
          );
          if (confirm.toLowerCase() === "y") {
            await this.request("DELETE", `/users/${deleteUserId}`);
            this.userIds = this.userIds.filter((id) => id !== deleteUserId);
          }
        }
        break;

      case "posts":
        const posts = await this.request("GET", "/posts");
        if (posts && Array.isArray(posts)) {
          posts.forEach((post: any) => {
            if (!this.postIds.includes(post.id)) {
              this.postIds.push(post.id);
            }
          });
        }
        break;

      case "post":
        const postId = args[0] || (await this.selectId("post"));
        if (postId) {
          await this.request("GET", `/posts/${postId}`);
        }
        break;

      case "create-post":
        const title = await this.question("Enter title: ");
        const content = await this.question("Enter content (optional): ");
        const authorId = await this.selectId(
          "user",
          "Select author (user ID): "
        );
        const publishedStr = await this.question("Published? (y/N): ");

        if (title && authorId) {
          await this.request("POST", "/posts", {
            title,
            content: content || undefined,
            authorId,
            published: publishedStr.toLowerCase() === "y",
          });
        }
        break;

      case "quick-post":
        if (this.userIds.length === 0) {
          console.log("❌ No user IDs available. Create a user first.");
          break;
        }
        const quickTimestamp = Date.now();
        await this.request("POST", "/posts", {
          title: `Test Post ${quickTimestamp}`,
          content: `This is a test post created at ${new Date().toISOString()}`,
          authorId: this.userIds[0],
          published: true,
        });
        break;

      case "update-post":
        const updatePostId = args[0] || (await this.selectId("post"));
        if (updatePostId) {
          const newTitle = await this.question("Enter new title (optional): ");
          const newContent = await this.question(
            "Enter new content (optional): "
          );
          const newPublishedStr = await this.question(
            "Published? (y/n/skip): "
          );

          const updatePostData: any = {};
          if (newTitle) updatePostData.title = newTitle;
          if (newContent) updatePostData.content = newContent;
          if (newPublishedStr.toLowerCase() === "y")
            updatePostData.published = true;
          if (newPublishedStr.toLowerCase() === "n")
            updatePostData.published = false;

          if (Object.keys(updatePostData).length > 0) {
            await this.request("PUT", `/posts/${updatePostId}`, updatePostData);
          }
        }
        break;

      case "delete-post":
        const deletePostId = args[0] || (await this.selectId("post"));
        if (deletePostId) {
          const confirm = await this.question(
            `Delete post ${deletePostId}? (y/N): `
          );
          if (confirm.toLowerCase() === "y") {
            await this.request("DELETE", `/posts/${deletePostId}`);
            this.postIds = this.postIds.filter((id) => id !== deletePostId);
          }
        }
        break;

      case "cleanup":
        const confirmCleanup = await this.question(
          "Delete all saved posts and users? (y/N): "
        );
        if (confirmCleanup.toLowerCase() === "y") {
          for (const postId of [...this.postIds]) {
            await this.request("DELETE", `/posts/${postId}`);
          }
          for (const userId of [...this.userIds]) {
            await this.request("DELETE", `/users/${userId}`);
          }
          this.userIds = [];
          this.postIds = [];
          console.log("✅ Cleanup completed");
        }
        break;

      case "test-errors":
        console.log("🚨 Testing error cases...");
        await this.request("POST", "/users", { name: "No Email" });
        await this.request("GET", "/users/non-existent");
        await this.request("POST", "/posts", { content: "No title" });
        break;

      case "test-all":
        console.log("🧪 Running comprehensive test...");
        await this.request("GET", "/health");
        await this.request("POST", "/users", {
          email: "test@example.com",
          name: "Test",
        });
        await this.request("GET", "/users");
        break;

      case "exit":
        console.log("👋 Goodbye!");
        rl.close();
        process.exit(0);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }
  }

  private async selectId(
    type: "user" | "post",
    prompt?: string
  ): Promise<string | null> {
    const ids = type === "user" ? this.userIds : this.postIds;

    if (ids.length === 0) {
      console.log(`❌ No saved ${type} IDs`);
      return null;
    }

    if (ids.length === 1) {
      return ids[0];
    }

    console.log(`Available ${type} IDs:`);
    ids.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });

    const selection = await this.question(
      prompt || `Select ${type} (1-${ids.length}): `
    );
    const index = parseInt(selection) - 1;

    if (index >= 0 && index < ids.length) {
      return ids[index];
    }

    console.log("❌ Invalid selection");
    return null;
  }

  async start() {
    this.showCommands();

    while (true) {
      try {
        const input = await this.question("\n🔧 Enter command: ");
        if (input) {
          await this.handleCommand(input);
        }
      } catch (error) {
        console.log("❌ Error:", error);
      }
    }
  }
}

// 启动调试器
const debuggers = new InteractiveAPIDebugger();
debuggers.start();
