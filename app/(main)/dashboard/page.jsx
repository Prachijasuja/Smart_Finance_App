import CreateAccountDrawer from "@/components/create-account-drawer";
import { Plus } from "lucide-react";
import "./DashboardPage.css";
import { Card,CardContent, } from "@/components/ui/card";
function DashboardPage() {
  return (
    <div className="dashboard-wrapper">
      
      <div className="dashboard-grid">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add new Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
      </div>
    </div>
  );
}

export default DashboardPage;
