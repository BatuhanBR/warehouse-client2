import React from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';

const UserModal = ({ visible, onCancel, onSubmit, initialData, roles }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialData || {
                isActive: true
            });
        } else {
            form.resetFields();
        }
    }, [visible, initialData, form]);

    return (
        <Modal
            title={initialData ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <Form.Item
                    name="username"
                    label="Kullanıcı Adı"
                    rules={[{ required: true, message: 'Kullanıcı adı gerekli!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="E-posta"
                    rules={[
                        {
                            type: 'email',
                            message: 'Geçerli bir e-posta adresi giriniz!',
                        }
                    ]}
                >
                    <Input />
                </Form.Item>

                {!initialData && (
                    <Form.Item
                        name="password"
                        label="Şifre"
                        rules={[{ required: true, message: 'Şifre gerekli!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                )}

                <Form.Item
                    name="roleId"
                    label="Rol"
                    rules={[{ required: true, message: 'Lütfen bir rol seçin!' }]}
                >
                    <Select>
                        {console.log('Modal içinde roles:', roles)}
                        {roles?.map(role => (
                            <Select.Option key={role.id} value={role.id}>
                                {role.description || role.name.toUpperCase()}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Durum"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    label="Telefon"
                    name="phone"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Adres"
                    name="address"
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserModal; 