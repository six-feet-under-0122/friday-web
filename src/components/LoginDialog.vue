<script setup>
import { ref } from 'vue';
import { authAPI } from '@/api';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'success']);

const userStore = useUserStore();
const isLogin = ref(true);
const formRef = ref();
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  username: [
    { required: true, message: '请输入您的昵称~~', trigger: 'blur' },
    { min: 3, max: 20, message: '有长度限制噢~（3-20个字符）', trigger: 'blur' }//失去焦点时验证
  ],
  password: [
    { required: true, message: '请输入密码~~', trigger: 'blur' },
    { min: 6, message: '密码要多于6个字符噢~', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码~~', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('菜鸡，密码不一致哦~'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const loading = ref(false);

const handleSubmit = async () => {
  await formRef.value.validate();
  loading.value = true;

  try {
    if (isLogin.value) {
      const res = await authAPI.login({
        username: form.value.username,
        password: form.value.password
      });
      userStore.setUser(res.token, res.username);
      ElMessage.success('登录成功~~');
    } else {
      await authAPI.register({
        username: form.value.username,
        password: form.value.password
      });
      ElMessage.success('注册成功，请登录');
      isLogin.value = true;
      form.value.password = '';
      form.value.confirmPassword = '';
      return;
    }
    emit('update:visible', false);
    emit('success');
  } finally {
    loading.value = false;
  }
};

const switchMode = () => {
  isLogin.value = !isLogin.value;
  formRef.value?.clearValidate();
  form.value = {
    username: '',
    password: '',
    confirmPassword: ''
  };
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="isLogin ? '登录' : '注册'"
    width="400px"
    @close="emit('update:visible', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <el-button text @click="switchMode">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </el-button>
        <div>
          <el-button @click="emit('update:visible', false)">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>