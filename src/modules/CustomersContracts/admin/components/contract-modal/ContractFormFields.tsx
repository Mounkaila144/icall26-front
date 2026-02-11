'use client';

import React from 'react';

import type { ContractTranslations } from '../../hooks/useContractTranslations';
import type { ContractFormData } from './contractFormDefaults';
import {
  formGroupStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  rowStyle,
  row3Style,
  sectionTitleStyle,
} from './contractModalStyles';

export interface FieldSectionProps {
  formData: ContractFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabledFields?: string[];
  hiddenFields?: string[];
  t: ContractTranslations;
}

// ==================== DATES ==================== //

export const DatesFields = React.memo(({ formData, handleInputChange, t }: FieldSectionProps) => (
  <>
    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="quoted_at">
          {t.dateQuote + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="date"
          id="quoted_at"
          name="quoted_at"
          value={formData.quoted_at}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="billing_at">
          {t.dateBilling + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="date"
          id="billing_at"
          name="billing_at"
          value={formData.billing_at}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
    </div>

    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="opened_at">
          {t.dateEngagement + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="date"
          id="opened_at"
          name="opened_at"
          value={formData.opened_at}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="opc_at">
          {t.dateOpc + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="date"
          id="opc_at"
          name="opc_at"
          value={formData.opc_at}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
    </div>

    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="sent_at">
          {t.dateSent}
        </label>
        <input
          type="date"
          id="sent_at"
          name="sent_at"
          value={formData.sent_at}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="payment_at">
          {t.datePayment}
        </label>
        <input
          type="date"
          id="payment_at"
          name="payment_at"
          value={formData.payment_at}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="apf_at">
          {t.dateApf}
        </label>
        <input
          type="date"
          id="apf_at"
          name="apf_at"
          value={formData.apf_at}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>
  </>
));

// ==================== CUSTOMER ==================== //

export const CustomerFields = React.memo(({ formData, handleInputChange, hiddenFields = [], t }: FieldSectionProps) => (
  <>
    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="customer.lastname">
          {t.lastName + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          id="customer.lastname"
          name="customer.lastname"
          value={formData.customer?.lastname || ''}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="customer.firstname">
          {t.firstName + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          id="customer.firstname"
          name="customer.firstname"
          value={formData.customer?.firstname || ''}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
    </div>

    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="customer.phone">
          {t.phone + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="tel"
          id="customer.phone"
          name="customer.phone"
          value={formData.customer?.phone || ''}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
      {!hiddenFields.includes('customer.union_id') && (
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="customer.union_id">
            {t.unionId}
          </label>
          <input
            type="number"
            id="customer.union_id"
            name="customer.union_id"
            value={formData.customer?.union_id || ''}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>
      )}
    </div>

    <div style={{ ...sectionTitleStyle, fontSize: '14px', marginTop: '16px', marginBottom: '12px', color: '#555' }}>
      <span>{"\uD83C\uDFE0"}</span>
      <span>{t.addressSection}</span>
    </div>

    <div style={formGroupStyle}>
      <label style={labelStyle} htmlFor="customer.address.address1">
        {t.address + ' '}<span style={{ color: '#dc3545' }}>*</span>
      </label>
      <input
        type="text"
        id="customer.address.address1"
        name="customer.address.address1"
        value={formData.customer?.address?.address1 || ''}
        onChange={handleInputChange}
        required
        style={inputStyle}
      />
    </div>

    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="customer.address.postcode">
          {t.postcode + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          id="customer.address.postcode"
          name="customer.address.postcode"
          value={formData.customer?.address?.postcode || ''}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="customer.address.city">
          {t.city + ' '}<span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          id="customer.address.city"
          name="customer.address.city"
          value={formData.customer?.address?.city || ''}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />
      </div>
    </div>
  </>
));

// ==================== TEAM ==================== //

export const TeamFields = React.memo(({ formData, handleInputChange, t }: FieldSectionProps) => (
  <>
    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="telepro_id">
          {t.teleproId}
        </label>
        <input
          type="number"
          id="telepro_id"
          name="telepro_id"
          value={formData.telepro_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="sale_1_id">
          {t.sale1Id}
        </label>
        <input
          type="number"
          id="sale_1_id"
          name="sale_1_id"
          value={formData.sale_1_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="sale_2_id">
          {t.sale2Id}
        </label>
        <input
          type="number"
          id="sale_2_id"
          name="sale_2_id"
          value={formData.sale_2_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>

    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="manager_id">
          {t.managerId}
        </label>
        <input
          type="number"
          id="manager_id"
          name="manager_id"
          value={formData.manager_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="assistant_id">
          {t.assistantId}
        </label>
        <input
          type="number"
          id="assistant_id"
          name="assistant_id"
          value={formData.assistant_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="installer_user_id">
          {t.installerId}
        </label>
        <input
          type="number"
          id="installer_user_id"
          name="installer_user_id"
          value={formData.installer_user_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>

    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="team_id">
          {t.teamId}
        </label>
        <input
          type="number"
          id="team_id"
          name="team_id"
          value={formData.team_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="company_id">
          {t.companyId}
        </label>
        <input
          type="number"
          id="company_id"
          name="company_id"
          value={formData.company_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>
  </>
));

// ==================== FINANCIAL ==================== //

export const FinancialFields = React.memo(({ formData, handleInputChange, t }: FieldSectionProps) => (
  <>
    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="financial_partner_id">
          {t.financialPartnerId}
        </label>
        <input
          type="number"
          id="financial_partner_id"
          name="financial_partner_id"
          value={formData.financial_partner_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="total_price_without_taxe">
          {t.priceHt}
        </label>
        <input
          type="number"
          step="0.01"
          id="total_price_without_taxe"
          name="total_price_without_taxe"
          value={formData.total_price_without_taxe || ''}
          onChange={handleInputChange}
          style={inputStyle}
          placeholder="0.00"
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="total_price_with_taxe">
          {t.priceTtc}
        </label>
        <input
          type="number"
          step="0.01"
          id="total_price_with_taxe"
          name="total_price_with_taxe"
          value={formData.total_price_with_taxe || ''}
          onChange={handleInputChange}
          style={inputStyle}
          placeholder="0.00"
        />
      </div>
    </div>

    <div style={formGroupStyle}>
      <label style={labelStyle} htmlFor="tax_id">
        {t.taxId}
      </label>
      <input
        type="number"
        id="tax_id"
        name="tax_id"
        value={formData.tax_id || ''}
        onChange={handleInputChange}
        style={inputStyle}
      />
    </div>
  </>
));

// ==================== STATUS ==================== //

export const StatusFields = React.memo(({ formData, handleInputChange, t }: FieldSectionProps) => (
  <>
    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="state_id">
          {t.stateId}
        </label>
        <input
          type="number"
          id="state_id"
          name="state_id"
          value={formData.state_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="install_state_id">
          {t.installStateId}
        </label>
        <input
          type="number"
          id="install_state_id"
          name="install_state_id"
          value={formData.install_state_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="admin_status_id">
          {t.adminStatusId}
        </label>
        <input
          type="number"
          id="admin_status_id"
          name="admin_status_id"
          value={formData.admin_status_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>

    <div style={row3Style}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="opened_at_range_id">
          {t.openedAtRangeId}
        </label>
        <input
          type="number"
          id="opened_at_range_id"
          name="opened_at_range_id"
          value={formData.opened_at_range_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="opc_range_id">
          {t.opcRangeId}
        </label>
        <input
          type="number"
          id="opc_range_id"
          name="opc_range_id"
          value={formData.opc_range_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="meeting_id">
          {t.meetingId}
        </label>
        <input
          type="number"
          id="meeting_id"
          name="meeting_id"
          value={formData.meeting_id || ''}
          onChange={handleInputChange}
          style={inputStyle}
        />
      </div>
    </div>

    <div style={rowStyle}>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="is_signed">
          {t.isSigned}
        </label>
        <select
          id="is_signed"
          name="is_signed"
          value={formData.is_signed}
          onChange={handleInputChange}
          style={inputStyle}
        >
          <option value="NO">{t.no}</option>
          <option value="YES">{t.yes}</option>
        </select>
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="status">
          {t.statusLabel}
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          style={inputStyle}
        >
          <option value="ACTIVE">{t.statusActive}</option>
          <option value="DELETE">{t.statusDeleted}</option>
        </select>
      </div>
    </div>
  </>
));

// ==================== OTHER ==================== //

export const OtherFields = React.memo(({ formData, handleInputChange, disabledFields = [], t }: FieldSectionProps) => (
  <>
    <div style={formGroupStyle}>
      <label style={labelStyle} htmlFor="reference">
        {t.reference}
      </label>
      <input
        type="text"
        id="reference"
        name="reference"
        value={formData.reference}
        onChange={handleInputChange}
        style={inputStyle}
        disabled={disabledFields.includes('reference')}
        placeholder={disabledFields.includes('reference') ? undefined : t.referencePlaceholder}
      />
    </div>

    <div style={formGroupStyle}>
      <label style={labelStyle} htmlFor="remarks">
        {t.remarks}
      </label>
      <textarea
        id="remarks"
        name="remarks"
        value={formData.remarks}
        onChange={handleInputChange}
        style={textareaStyle}
        placeholder={t.remarksPlaceholder}
      />
    </div>

    <div style={formGroupStyle}>
      <label style={labelStyle} htmlFor="customer_id">
        {disabledFields.includes('customer_id') ? t.customerId : t.customerIdOptional}
      </label>
      <input
        type="number"
        id="customer_id"
        name="customer_id"
        value={formData.customer_id || ''}
        onChange={handleInputChange}
        style={inputStyle}
        disabled={disabledFields.includes('customer_id')}
        placeholder={disabledFields.includes('customer_id') ? undefined : t.customerIdPlaceholder}
      />
    </div>
  </>
));
