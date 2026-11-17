<script setup lang="ts">
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Breadcrumb from '~/components/molecules/BreadCrumbs/Breadcrumb.vue';
import Aside from '~/components/organism/Sidebar/Aside.vue';

const varView = useVarView()

onMounted(() => {
    varView.showBreadCrumb = true
})
</script>

<template>
    <div class="relative"
        :class="{ 'grid-cols-[180px_1fr]': varView.expandido, 'grid-cols-[20px_1fr]': !varView.expandido }">
        <Aside class="fixed "></Aside>
        <FondoDefault :class="{'ml-30': varView.expandido}">
            <Breadcrumb></Breadcrumb>
            <slot/>
        </FondoDefault>
    </div>
</template>