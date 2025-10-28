-- Fix critical security issue: Replace overly permissive invoice RLS policies
-- Migration: Secure Invoice Tables

-- ============================================
-- INVOICES TABLE: Fix RLS Policies
-- ============================================

-- Drop dangerous policies that allow all authenticated users full access
DROP POLICY IF EXISTS "Users can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;

-- Create secure role-based policies for invoices

-- SELECT: Users can view invoices they created OR if they're an admin
CREATE POLICY "Users can view own invoices or admins view all"
  ON public.invoices
  FOR SELECT
  USING (
    created_by = auth.uid() 
    OR public.has_role(auth.uid(), 'Administrator'::app_role)
    OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
  );

-- INSERT: Users can create invoices (created_by must be auth.uid())
CREATE POLICY "Users can create own invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Only admins can update invoices
CREATE POLICY "Admins can update invoices"
  ON public.invoices
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'Administrator'::app_role)
    OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
  );

-- DELETE: Only admins can delete invoices
CREATE POLICY "Admins can delete invoices"
  ON public.invoices
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'Administrator'::app_role)
    OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
  );

-- ============================================
-- INVOICE_ITEMS TABLE: Fix RLS Policies
-- ============================================

-- Drop dangerous policies on invoice_items
DROP POLICY IF EXISTS "Users can view all invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

-- Create secure policies for invoice_items (tied to parent invoice)

-- SELECT: Users can view invoice items if they can view the parent invoice
CREATE POLICY "Users can view invoice items for their invoices"
  ON public.invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.created_by = auth.uid()
        OR public.has_role(auth.uid(), 'Administrator'::app_role)
        OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
      )
    )
  );

-- INSERT: Users can add items to their own invoices
CREATE POLICY "Users can add items to own invoices"
  ON public.invoice_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.created_by = auth.uid()
    )
  );

-- UPDATE: Only admins can update invoice items
CREATE POLICY "Admins can update invoice items"
  ON public.invoice_items
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'Administrator'::app_role)
    OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
  );

-- DELETE: Only admins can delete invoice items
CREATE POLICY "Admins can delete invoice items"
  ON public.invoice_items
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'Administrator'::app_role)
    OR public.has_role(auth.uid(), 'Super Administrator'::app_role)
  );

-- Add comment for audit trail
COMMENT ON TABLE public.invoices IS 'Financial invoicing data - RLS policies enforce user ownership and admin access only';
COMMENT ON TABLE public.invoice_items IS 'Invoice line items - RLS policies tied to parent invoice ownership';