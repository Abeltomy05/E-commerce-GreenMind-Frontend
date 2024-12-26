import React from 'react';
import "./adminLayout.scss";
import { Sidebar } from "../../../components/layout/sidebar";
import { Outlet } from 'react-router-dom';
import AdminBreadcrumbs from '../../../components/breadcrumbs/breadcrumbs';

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}